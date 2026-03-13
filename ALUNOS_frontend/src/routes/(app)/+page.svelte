<script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { redirect } from "@sveltejs/kit";

  if (browser) {
    goto('/exemplos');
  } else {
    redirect(307, "/exemplos")
  }
</script>