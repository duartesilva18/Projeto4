-- =========================================================
--  INSERIR ESCOLAS (idempotente)
-- =========================================================

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = '3161')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('3161', 'ESA');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = '3162')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('3162', 'ESE');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = '3163')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('3163', 'ESTG');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = '3164')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('3164', 'ESCE');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = '7075')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('7075', 'ESS');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.escola WHERE codigo_escola = 'ESDL')
  INSERT INTO vagas.escola (codigo_escola, nome_escola) VALUES ('ESDL', 'ESDL');
GO

-- =========================================================
--  INSERIR CURSOS (idempotente)
--  Todos os cursos ativos das 6 escolas
-- =========================================================

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6799' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '6799', 'Agricultura Biológica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '90000' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '90000', 'Agricultura Biológica e Desenvolvimento Rural', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '265' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '265', 'Agricultura Integrada em Edifícios: Coberturas e Paredes Verdes', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9003' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '9003', 'Agronomia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5033' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5033', 'Análises e Gestão Laboratorial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '401' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '401', 'Ano Zero - ESA', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9016' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '9016', 'Biotecnologia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '42' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '42', 'Biotecnologia Agroambiental', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8155' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '8155', 'Ciências e Tecnologias do Ambiente', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5002' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5002', 'Cuidados Veterinários', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7185' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '7185', 'Cuidados Veterinários', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '241' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '241', 'Curso de Capacitação em Intervenções Assistidas por Animais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9085' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '9085', 'Enfermagem Veterinária', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '30' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '30', 'Enfermagem Veterinária em Animais de Companhia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '148' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '148', 'Enfermagem Veterinária Médico-Cirúrgica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '29' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '29', 'Engenharia Agronómica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9086' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '9086', 'Engenharia Agronómica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9099' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '9099', 'Engenharia do Ambiente', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '60' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '60', 'Engenharia do Ambiente e Geoinformática', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '86' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '86', 'Engenharia do Território e do Ambiente', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '72' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '72', 'Erasmus - ESA', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '273' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '273', 'Fotogrametria: levantamentos fotogramétricos com recurso a Drone', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5029' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5029', 'Fruticultura, Viticultura e Enologia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5032' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5032', 'Geoinformática e Gestão de Recursos Naturais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '37' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '37', 'Gestão Ambiental e Ordenamento do Território', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7168' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '7168', 'Gestão da Animação Turística em Espaço Rural', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7223' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '7223', 'Gestão da Qualidade e Sistemas Ambientais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5022' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5022', 'Gestão de Empresas Agrícolas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5005' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5005', 'Gestão do Turismo em Espaço Rural', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5004' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5004', 'Gestão e Qualidade Ambiental', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '296' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '296', 'Gestão Eficiente da Água de Rega na Viticultura', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5037' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5037', 'Indústrias Biotecnológicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '178' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '178', 'Infraestruturas Verdes Urbanas: Coberturas e Fachadas Verdes', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '118' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '118', 'Intervenções Assistidas por Animais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '46' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '46', 'Isoladas - ESA', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5023' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5023', 'Marketing Agroalimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5003' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5003', 'Mecanização e Automação Agrícola', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7199' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '7199', 'Mecanização e Tecnologia Agrária', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '107' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '107', 'One Health', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '210' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '210', 'Piloto de Drone', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5030' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5030', 'Riscos e Proteção Civil', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7133' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '7133', 'Sistemas de Informação Geográfica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5038' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '5038', 'Turismo Rural e de Natureza', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '199' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '199', 'Viticultura Sustentável', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '28' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3161'), '28', 'Zootecnia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '117' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '117', 'Administração e Gestão Escolar e Inovação Educacional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '95' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '95', 'Administração Escolar e Inovação Educacional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '402' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '402', 'Ano Zero - ESE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5042' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5042', 'Arte e Fabricação Digital', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '284' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '284', 'Artes e Cinema Digital', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '108' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '108', 'Artes e Património Náutico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5025' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5025', 'Artes e Tecnologia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '55' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '55', 'Artes Plásticas e Tecnologias Artísticas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '261' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '261', 'Autobiografias: Antropologia, Cinema e Educação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '112' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '112', 'Avaliação Gerontológica Multidimensional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '201' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '201', 'Capacitação para a Educação Digital', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '103' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '103', 'Conexões Matemáticas e a Abordagem Steam no Ensino Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '183' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '183', 'Da consciência fonológica à leitura', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6689' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6689', 'Educação Artística', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9853' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '9853', 'Educação Básica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '256' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '256', 'Educação em Contextos Multiculturais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '200' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '200', 'Educação Especial e Inclusão', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '101' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '101', 'Educação Literária e Literatura para Infância e Juventude', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '87' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '87', 'Educação Motora nas Primeiras Idades', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '104' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '104', 'Educação para o Desenvolvimento e Cidadania Global: aprendizagens e alternativas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6914' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6914', 'Educação Pré-Escolar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6915' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6915', 'Educação Pré-Escolar e Ensino do 1º Ciclo do EB', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9473' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '9473', 'Educação Social Gerontológica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '102' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '102', 'Educação, Ciência e Património local', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '69' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '69', 'Ensino do 1.º Ciclo do Ensino Básico e de Português e História e Geografia de Portugal no 2.º Ciclo do Ensino Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6925' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6925', 'Ensino do 1.º Ciclo e do 2.º Ciclo do Ensino Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '70' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '70', 'Ensino do 1º Ciclo do Ensino Básico e de Matemática e Ciências Naturais no 2º Ciclo do Ensino Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '73' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '73', 'Erasmus - ESE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9833' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '9833', 'Gerontologia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6419' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6419', 'Gerontologia Social', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '65' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '65', 'Gestão Artística e Cultural', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9859' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '9859', 'Gestão Artística e Cultural', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8112' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '8112', 'Gestão Artística e Cultural (pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5034' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5034', 'Ilustração e Produção Gráfica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5007' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5007', 'Intervenção Educativa em Creche', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5031' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5031', 'Intervenção Sociocomunitária e Envelhecimento', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '47' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '47', 'Isoladas - ESE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '262' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '262', 'Joalharia - Resíduos Marítimos e Potencialidades', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '191' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '191', 'Património marítimo-fluvial: Estuque Decorativo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '64' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '64', 'Promoção e Educação para a Saúde', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5035' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '5035', 'Serviços Educativos e Património Local', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '111' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '111', 'Serviços Educativos e Valorização do Património', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6248' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '6248', 'Supervisão Pedagógica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '41' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '41', 'Tecnologias da Informação e Comunicação em Educação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '255' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '255', 'Tecnologias para a Inclusão e Acessibilidade', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '257' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '257', 'Trajetórias (In)Adaptativas do Desenvolvimento', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '258' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3162'), '258', 'Transição para a Vida Pós-Escolar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '10' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '10', 'Academia Sénior IPVC', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5026' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5026', 'Alimentação e Restauração Coletiva', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '285' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '285', 'Análise de Dados com PowerBI', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '286' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '286', 'Análise de Dados com Python', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '403' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '403', 'Ano Zero - ESTG', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7105' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7105', 'Aplicações Informáticas de Gestão', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '236' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '236', 'Aquacultura e Biotecnologia Azul', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '229' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '229', 'Base de Dados', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '280' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '280', 'Business Intelligence', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '287' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '287', 'Cibersegurança', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '81' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '81', 'Cibersegurança', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '50' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '50', 'Ciência e Tecnologia Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '212' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '212', 'Conceitos de Sustentabilidade - Nível Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7117' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7117', 'Construção Civil e Obras Públicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5010' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5010', 'Construção e Reabilitação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '18' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '18', 'Construções Civis', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6395' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '6395', 'Contabilidade e Finanças', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '230' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '230', 'Criação de Conteúdos Digitais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '279' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '279', 'Cultura de Segurança e Saúde em Meio Marítimo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7101' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7101', 'Desenvolvimento de Produtos Multimédia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '232' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '232', 'Desenvolvimento Sustentável', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5008' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5008', 'Desenvolvimento Web e Multimédia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9723' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9723', 'Design de Ambientes', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7342' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7342', 'Design de Comunicação Digital', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '88' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '88', 'Design de Interiores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '185' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '185', 'Design de Interiores de Barcos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9727' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9727', 'Design do Produto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '16' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '16', 'Design Integrado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '267' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '267', 'Dieta Atlântica: fine dining, vinhos e experiências únicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '268' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '268', 'Dieta Atlântica: Inovação na confeção do pescado do litoral Minhoto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '269' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '269', 'Dieta Atlântica: storytelling da gastronomia tradicional do litoral Minhoto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '231' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '231', 'Direito do Mar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5009' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5009', 'Eficiência Energética nos Edifícios', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '136' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '136', 'Eletrónica e Eletrificação Automóvel', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '15' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '15', 'Empreendedorismo e Inovação na Industria Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7119' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7119', 'Energias Renováveis', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '235' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '235', 'Energias Renováveis Oceânicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9087' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9087', 'Engenharia Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9567' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9567', 'Engenharia Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '66' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '66', 'Engenharia Civil e do Ambiente', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9743' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9743', 'Engenharia Civil e do Ambiente', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8124' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '8124', 'Engenharia Civil e do Ambiente (regime pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8407' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '8407', 'Engenharia da Computação Gráfica e Multimédia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '57' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '57', 'Engenharia de Redes e Sistemas de Computadores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9857' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9857', 'Engenharia de Sistemas de Energias Renováveis', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8446' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '8446', 'Engenharia de Sistemas de Energias Renováveis (pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6295' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '6295', 'Engenharia de Software', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '131' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '131', 'Engenharia e Gestão Industrial e da Inovação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8312' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '8312', 'Engenharia e Tecnologia de Materiais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9750' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9750', 'Engenharia Electrónica e Redes de Computadores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9119' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9119', 'Engenharia Informática', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9286' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9286', 'Engenharia Informática', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9885' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9885', 'Engenharia Informática (pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9123' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9123', 'Engenharia Mecânica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '139' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '139', 'Engenharia Mecânica, Energia e Materiais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '141' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '141', 'Engenharia Mecânica, Energia e Materiais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9751' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9751', 'Engenharia Mecatrónica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '45' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '45', 'Erasmus', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '74' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '74', 'Erasmus - ESTG', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '219' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '219', 'Especialização em Dados - Nível Avançado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '218' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '218', 'Estratégias para Territórios Inteligentes - Nível Avançado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '184' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '184', 'Finanças para não financeiros', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '266' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '266', 'Food Design', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '80' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '80', 'Formação Cisco CCNA', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '213' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '213', 'Fundamentos em Análise de Dados - Nível Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '59' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '59', 'Gastronomia e Artes Culinárias', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9147' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9147', 'Gestão', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9148' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9148', 'Gestão (nocturno)', 'Nocturno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '25' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '25', 'Gestão da Qualidade e Segurança Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '14' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '14', 'Gestão das Organizações : Ramo de Gestão de Empresas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '276' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '276', 'Gestão de Ativos Offshore', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5013' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5013', 'Gestão Hoteleira', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '142' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '142', 'Gestão Industrial e da Inovação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '143' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '143', 'Gestão Industrial e da Inovação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '214' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '214', 'Gestão Urbana Inteligente - Nível Intermédio', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '115' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '115', 'Guias Regionais do Porto e Norte de Portugal', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '289' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '289', 'HACKATON - Desenvolvimento de Aplicações Web', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '277' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '277', 'Hidrogénio e as Energias Oceânicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5043' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5043', 'Impressão 3D e Maquinação Automática', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '98' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '98', 'Informática de Segurança e Computação Forense', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '278' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '278', 'Inovação e Certificação de Tecnologias Offshore', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7102' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7102', 'Instalação e Manutenção de Redes e Sistemas Informáticos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '244' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '244', 'Inteligência Artificial nas Organizações', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '271' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '271', 'Inteligência Artificial no Ensino', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '260' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '260', 'Inteligência Artificial: Da Teoria à Implementação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '48' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '48', 'Isoladas - ESTG', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '222' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '222', 'Liderança em Economia Azul Sustentável', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '217' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '217', 'Liderança Sustentável - Nível Avançado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '43' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '43', 'Língua Portuguesa e Relações Comerciais China - Países Lusófonos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '293' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '293', 'MakerDay - Digitalização e Robótica Aplicada à Educação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5017' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5017', 'Manutenção Mecânica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5040' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5040', 'Mecânica Automóvel', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5018' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5018', 'Mecatrónica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '82' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '82', 'Mestrado em Construção - Universidade Agostinho Neto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '295' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '295', 'Metodologias e Estratégias de Ensino e Avaliação com Inteligência Artificial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '270' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '270', 'Microsoft Excel', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5027' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5027', 'Modelação e Gestão de Informação em Edifícios', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '237' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '237', 'Modelos de Negócio', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '220' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '220', 'Operadores de Pórticos, Gruas e Máquinas de Movimentação Horizontal', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '233' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '233', 'Ordenamento do Território', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5016' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5016', 'Organização e Controlo Industrial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '215' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '215', 'Prática Sustentável - Nível Intermédio', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '211' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '211', 'Princípios Fundamentais das Cidades Inteligentes - Nível Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5028' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5028', 'Processo Industrial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '216' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '216', 'Proficiência em Análise de Dados - Nível Intermédio', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '272' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '272', 'Programação Visual Para Professores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '54' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '54', 'Programador de Informática (IEFP)', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '56' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '56', 'Protocolo IES Internacional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '58' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '58', 'Protocolo IES Nacional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7109' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7109', 'Qualidade Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7110' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7110', 'Qualidade Ambiental', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5011' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5011', 'Qualidade e Segurança Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5020' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5020', 'Redes e Sistemas Informáticos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '259' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '259', 'Redes Neuronais e Tensorflow (Deep Learning) com Python', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5012' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5012', 'Regeneração Urbana', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '300' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '300', 'Robôs Educativos Digitais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '27' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '27', 'Segurança do Trabalho', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '274' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '274', 'Sistemas de Energia Renovável Oceânica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '24' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '24', 'Sistemas de Energias Renováveis', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5039' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5039', 'Sistemas Elétricos de Energia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5015' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5015', 'Sistemas Eletrónicos e Computadores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7146' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7146', 'Sistemas Eletrónicos e Computadores', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '275' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '275', 'Sistemas Eletrotécnicos Offshore', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '2' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '2', 'Sócrates', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '263' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '263', 'Sustentabilidade de Recursos Hídricos e Recursos Marinhos - Nível Avançado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7135' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7135', 'Técnicas e Gestão Hoteleira', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7182' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7182', 'Tecnologia Alimentar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '1100' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '1100', 'Tecnologia Alimentar e Nutrição', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6801' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '6801', 'Tecnologia Cerâmica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6797' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '6797', 'Tecnologia e Gestão de Sistemas de Informação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '224' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '224', 'Tecnologia e Inovação em Vidro', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7138' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '7138', 'Tecnologia e Programação de Sistemas de Informação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5014' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5014', 'Tecnologias e Programação de Sistemas de Informação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '264' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '264', 'Tecnologias em Energias Oceânicas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9254' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '9254', 'Turismo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8114' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '8114', 'Turismo (regime pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '234' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '234', 'Turismo Azul Sustentável', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5044' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '5044', 'Turismo de Gastronomia e Vinhos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '133' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '133', 'Turismo e Inovação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '17' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3163'), '17', 'Turismo, Inovação e Desenvolvimento', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '404' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '404', 'Ano Zero - ESCE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9498' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '9498', 'Contabilidade e Fiscalidade', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9872' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '9872', 'Contabilidade e Fiscalidade (regime pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7161' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '7161', 'Contabilidade e Gestão', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5021' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5021', 'Contabilidade e Gestão para PME', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '282' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '282', 'Corporate Sustainability Reporting Directive (CSRD) e Elaboração de Relatórios de Sustentabilidade: Da Teoria à Prática', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '175' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '175', 'Criação de Negócios', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '75' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '75', 'Erasmus - ESCE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8464' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '8464', 'Gestão da Distribuição e Logística', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '51' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '51', 'Gestão da Distribuição e Logística (regime pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '3549' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '3549', 'Gestão da Qualidade', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5000' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5000', 'Gestão da Qualidade', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '205' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '205', 'Gestão de Serviços, Inovação e Transformação Digital I- Nível Básico', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '206' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '206', 'Gestão de Serviços, Inovação e Transformação Digital III - Avançado', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '147' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '147', 'Gestão de Transporte e Logística Marítima', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5036' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5036', 'Gestão e Melhoria Contínua nas Empresas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5047' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5047', 'Gestão Industrial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9186' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '9186', 'Informática de Gestão', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '193' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '193', 'Inteligência Artificial em Marketing e Comunicação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '281' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '281', 'Interpretação ISO 20121:2024 - Sistemas de Gestão de Eventos Sustentáveis', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '49' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '49', 'Isoladas - ESCE', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '110' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '110', 'Logística', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '7246' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '7246', 'Logística', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '89' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '89', 'Logística e Transporte Marítimo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9314' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '9314', 'Marketing', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '137' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '137', 'Marketing Digital', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '99' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '99', 'Marketing Digital e E-Business', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5041' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5041', 'Marketing Digital e E-Commerce', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '1101' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '1101', 'Marketing e Comunicação Empresariais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9664' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '9664', 'Marketing e Comunicação Empresarial', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8444' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '8444', 'Marketing e Comunicação Empresarial (regime pós-laboral)', 'Pós-Laboral');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '174' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '174', 'Marketing Estratégico e Operacional', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '90' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '90', 'Marketing para a Economia Azul', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5046' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5046', 'Negócios Digitais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '8516' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '8516', 'Organização e Gestão Empresariais', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '192' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '192', 'Projeto de Inovação Pedagógica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5001' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '3164'), '5001', 'Transporte e Logística', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '283' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '283', 'Acesso Via Aérea em Situações Complexas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '239' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '239', 'Acessos Vasculares Ecoguiados e Por Infravermelhos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '181' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '181', 'Alimentação Ao Longo Do Ciclo De Vida', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '405' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '405', 'Ano Zero - ESS', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '301' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '301', 'Cinesiologia e Bandas Neuromusculares', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '170' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '170', 'Cuidados Imediatos de Saúde e Suporte Básico de Vida', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '124' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '124', 'Cuidados Paliativos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '6680' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '6680', 'Cuidados Paliativos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '146' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '146', 'Cuidados Paliativos Pediátricos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '84' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '84', 'Cuidados Paliativos Pediátricos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9500' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '9500', 'Enfermagem', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '83' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '83', 'Enfermagem à Pessoa em Situação Paliativa', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '79' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '79', 'Enfermagem Comunitária', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '130' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '130', 'Enfermagem Comunitária na área de Enfermagem de Saúde Familiar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '144' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '144', 'Enfermagem Comunitária, na área de enfermagem de Saúde Comunitária e de Saúde Pública', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '23' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '23', 'Enfermagem de Reabilitação', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '20' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '20', 'Enfermagem de Saúde comunitária', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '129' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '129', 'Enfermagem de Saúde Familiar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '132' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '132', 'Enfermagem de Saúde Materna e Obstétrica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '26' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '26', 'Enfermagem de Saúde Materna e Obstetrícia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '138' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '138', 'Enfermagem de Saúde Mental e Psiquiátrica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '19' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '19', 'Enfermagem Médico-Cirúrgica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '140' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '140', 'Enfermagem Médico-Cirúrgica na área de Enfermagem à Pessoa em Situação Critica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '76' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '76', 'Erasmus - ESS', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9504' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '9504', 'Fisioterapia', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '238' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '238', 'Gamificação em Saúde', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '121' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '121', 'Gestão das Organizações - Ramo de Gestão de Unidades de Saúde', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '288' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '288', 'Gestão de Emergências em Adultos e Idosos', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '294' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '294', 'Gestão de Emergências Neonatais e Pediátricas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '291' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '291', 'Gestão de Emergências Obstétricas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '292' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '292', 'Intervenções Psicoterapêuticas na Área do Pensamento', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '52' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '52', 'Isoladas - ESS', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '127' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '127', 'Pós-Graduação Supervisão Pedagógica', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '38' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '38', 'Quiromassagem', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '106' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '106', 'Saúde Mental e Gestão do Stress', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '221' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '221', 'Terapias Integrativas - um complemento ao Duche Vichy', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5019' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '5019', 'Termalismo e Bem-estar', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '290' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '290', 'Tratamento Estatístico de Dados em Saúde', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '12' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = '7075'), '12', 'Tratamento Estatístico de dados em Saúde ESS', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '1102' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '1102', 'Animação Desportiva e Turismo Ativo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '406' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '406', 'Ano Zero - ESDL', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '223' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '223', 'Antropometria ISAK - Nível 1', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '40' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '40', 'Atividades de Fitness', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '105' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '105', 'Avaliação, planeamento e performance em Trail Running', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '242' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '242', 'Contencioso Desportivo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '9731' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '9731', 'Desporto e Lazer', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '68' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '68', 'Desporto Natureza', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '78' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '78', 'Desporto Natureza', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '119' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '119', 'Direito e Desporto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '243' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '243', 'Direito Marítimo Desportivo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '145' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '145', 'Direito, Desporto e ESG', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '77' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '77', 'Erasmus - ESDL', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '240' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '240', 'Fisiologia da Adaptação à Altitude: do Conhecimento Científico às Aplicações Práticas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '134' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '134', 'Fisiologia do Exercício e Promoção da Saúde', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '53' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '53', 'Isoladas - ESDL', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '120' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '120', 'Surf Performance e Sustentabilidade', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '109' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '109', 'Tecnologias do Desporto', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5024' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '5024', 'Trabalhos em Altura e Acesso por Cordas', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '5006' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '5006', 'Treino Desportivo', 'Diurno');
GO

IF NOT EXISTS (SELECT 1 FROM vagas.curso WHERE codigo_dges = '71' AND id_escola = (SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'))
  INSERT INTO vagas.curso (id_escola, codigo_dges, nome_curso, regime)
  VALUES ((SELECT id_escola FROM vagas.escola WHERE codigo_escola = 'ESDL'), '71', 'Treino Desportivo', 'Diurno');
GO
