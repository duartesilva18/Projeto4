<script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { redirect } from "@sveltejs/kit";

  if (browser) {
    goto('/proposta-vagas');
  } else {
    redirect(307, "/proposta-vagas")
  }
</script>