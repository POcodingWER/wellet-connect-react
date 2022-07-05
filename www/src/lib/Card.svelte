<script>
	export let title;
</script>

<div class="card mb-3">
  {#if title}
  <h5 class="card-header">{title}</h5>
  {/if}
  <div class="card-body">
    <slot></slot>
  </div>
</div>