import {
  DGES_DOC_FIELD_MAP,
  type DgesDocType,
  type DgesFieldUpdate,
  type DgesMatchedUpdate,
  type DgesParsedRow,
  type DgesUnmatchedRow
} from './dges-statcol.types';

export interface CourseIndexRow {
  id: string;
  idCursoOferta: number;
  courseCode: string;
  courseName: string;
  schoolName: string;
  schoolCode?: string;
  anoLetivoInicio: number;
  importedFields?: string[];
  [key: string]: unknown;
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildCourseIndex(rows: CourseIndexRow[], anoInicio: number): CourseIndexRow[] {
  return rows.filter((r) => Number(r.anoLetivoInicio) === anoInicio);
}

function findCourse(
  index: CourseIndexRow[],
  parsed: DgesParsedRow
): { course?: CourseIndexRow; ambiguous?: boolean } {
  const code = String(parsed.codigoDges).trim();
  const byCode = index.filter((r) => String(r.courseCode).trim() === code);
  if (byCode.length === 1) return { course: byCode[0] };
  if (byCode.length > 1 && parsed.codigoEscola) {
    const bySchool = byCode.find(
      (r) => String(r.schoolCode ?? '').trim() === String(parsed.codigoEscola).trim()
    );
    if (bySchool) return { course: bySchool };
  }
  if (byCode.length > 1) {
    const target = normalizeName(parsed.nomeCurso);
    const byName = byCode.find((r) => normalizeName(String(r.courseName)) === target);
    if (byName) return { course: byName };
    return { ambiguous: true };
  }

  const target = normalizeName(parsed.nomeCurso);
  const byNameOnly = index.find((r) => normalizeName(String(r.courseName)) === target);
  return byNameOnly ? { course: byNameOnly } : {};
}

function getImportedFields(row: CourseIndexRow): string[] {
  return Array.isArray(row.importedFields) ? row.importedFields : [];
}

function resolveFieldUpdate(
  key: string,
  currentValue: number,
  newValue: number,
  overwrite: boolean,
  importedFields: string[]
): DgesFieldUpdate {
  if (overwrite || currentValue === 0) {
    return { fieldKey: key, currentValue, newValue };
  }
  if (importedFields.includes(key)) {
    return { fieldKey: key, currentValue, newValue };
  }
  return {
    fieldKey: key,
    currentValue,
    newValue,
    skipped: true,
    skipReason: 'Valor manual existente'
  };
}

function getFieldValue(row: CourseIndexRow, key: string): number {
  const v = Number(row[key]);
  return Number.isFinite(v) ? v : 0;
}

export function matchParsedRows(
  parsedRows: DgesParsedRow[],
  tableRows: CourseIndexRow[],
  anoInicio: number,
  docType: DgesDocType,
  overwrite: boolean
): { matched: DgesMatchedUpdate[]; unmatched: DgesUnmatchedRow[] } {
  if (docType === 'desconhecido') {
    return {
      matched: [],
      unmatched: parsedRows.map((p) => ({
        codigoDges: p.codigoDges,
        nomeCurso: p.nomeCurso,
        codigoEscola: p.codigoEscola,
        reason: 'Tipo de documento não identificado'
      }))
    };
  }

  const fieldMap = DGES_DOC_FIELD_MAP[docType];
  const index = buildCourseIndex(tableRows, anoInicio);
  const matched: DgesMatchedUpdate[] = [];
  const unmatched: DgesUnmatchedRow[] = [];

  for (const parsed of parsedRows) {
    const { course, ambiguous } = findCourse(index, parsed);
    if (ambiguous) {
      unmatched.push({
        codigoDges: parsed.codigoDges,
        nomeCurso: parsed.nomeCurso,
        codigoEscola: parsed.codigoEscola,
        reason: 'Código DGES ambíguo — vários cursos na BD; confirme escola ou nome'
      });
      continue;
    }
    if (!course) {
      unmatched.push({
        codigoDges: parsed.codigoDges,
        nomeCurso: parsed.nomeCurso,
        codigoEscola: parsed.codigoEscola,
        reason: 'Curso não encontrado na base de dados para o ano selecionado'
      });
      continue;
    }

    const importedFields = getImportedFields(course);
    const fields: DgesFieldUpdate[] = [];

    if (docType.startsWith('classificacoes') && parsed.classificacao != null) {
      const def = fieldMap[0];
      const key = def.keys[0];
      const currentValue = getFieldValue(course, key);
      fields.push(
        resolveFieldUpdate(key, currentValue, parsed.classificacao, overwrite, importedFields)
      );
    } else if (parsed.fieldValues && Object.keys(parsed.fieldValues).length > 0) {
      for (const [key, newValue] of Object.entries(parsed.fieldValues)) {
        const currentValue = getFieldValue(course, key);
        fields.push(resolveFieldUpdate(key, currentValue, newValue, overwrite, importedFields));
      }
    } else if (parsed.valores && docType.startsWith('estatistica')) {
      for (let i = 0; i < fieldMap.length; i++) {
        const def = fieldMap[i];
        const key = def.keys[0];
        const newValue = parsed.valores[i] ?? 0;
        const currentValue = getFieldValue(course, key);
        fields.push(resolveFieldUpdate(key, currentValue, newValue, overwrite, importedFields));
      }
    }

    const applicable = fields.filter((f) => !f.skipped);
    if (applicable.length === 0 && fields.length > 0) {
      matched.push({
        rowId: course.id,
        idCursoOferta: course.idCursoOferta,
        courseCode: String(course.courseCode),
        courseName: String(course.courseName),
        schoolName: String(course.schoolName),
        fields
      });
      continue;
    }

    if (fields.length > 0) {
      matched.push({
        rowId: course.id,
        idCursoOferta: course.idCursoOferta,
        courseCode: String(course.courseCode),
        courseName: String(course.courseName),
        schoolName: String(course.schoolName),
        fields
      });
    }
  }

  return { matched, unmatched };
}
