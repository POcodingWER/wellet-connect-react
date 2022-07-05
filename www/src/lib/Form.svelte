<script>
	export let label;
	export let id;
	export let cols;
	export let type = 'text';
	export let disabled = false;
	export let placeholder = '';
	export let value;
</script>

{#if cols}
  <div class="mb-3 row">
    <label class={`col-sm-${12 - cols} col-form-label`} for={id}>{label}</label>
    <div class={`col-sm-${cols}`}>
      <input class="form-control"
        id={id} disabled={disabled} placeholder={placeholder}
        bind:value={value}
      />
    </div>
  </div>
{:else}
  <div class="mb-3">
    {#if label}
    <label for={id} class="form-label">{label}</label>
    {/if}
    <input class="form-control"
      id={id} disabled={disabled} placeholder={placeholder}
      bind:value={value}
    />
  </div>
{/if}