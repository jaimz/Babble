<script type='text/html' id='entities'>
  {{each Entities}}
  <span class='bbl-entity' data-tid='${ EntityIds()[$value] }'>${$value}</span>
  {{/each}}
</script>