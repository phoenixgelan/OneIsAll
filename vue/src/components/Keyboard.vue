<template>
<div id="div">
  <p @click="ll">keyboard</p>
  <input type="button" value="clickme" @click="ll" />
</div>
</template>

<script>
import jquery from 'jquery';
import saveAs from 'file-saver';
import '../utils/jquery.wordexport'
export default {
  name: 'keyboard',
  methods: {
    ll() {
      console.log('lick');
      $('#div').wordExport();
    }
  }
}
</script>

<style scoped>

</style>
