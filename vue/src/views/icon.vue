<template>
 <!-- <div class="checkbox"> -->
 <!--   <div class="checkbox-inner"></div> -->
 <!-- </div> -->
 <div class="icon"></div>
</template>

<script>

</script>

<style scoped lang="less">
@primaryBlue: #1890FF;
@primaryWhite: #FFF;
@primaryBlack: rgba(0, 0, 0, .6);

.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid red;
  background: url(a.png)
}

// .checkbox {
//   position: relative;
//   display: inline-block;
//   width: 12px;
//   height: 12px;
//   border: 1px solid @primaryBlack;
//   border-radius: 2px;
//   transition: all 1s;

//   &:hover {
//     border-color: @primaryBlue;
//     cursor: pointer;
//   }

//   &.checked {
//     background-color: @primaryBlue;
//     border: 1px solid @primaryBlue;

//     & .checkbox-inner {
//       position: absolute;
//       width: 5px;
//       height: 2px;
//       background-color: @primaryBlue;
//       transform: rotate(-45deg);
//       top: 1px;
//       left: 1px;
//       border-radius: 1px;
//       border-bottom: 2px solid @primaryWhite;
//       border-left: 2px solid @primaryWhite;
//       border-top: 2px solid @primaryBlue;
//       border-right: 2px solid @primaryBlue;
//     }
//   }

//   &.half-checked {
//     border: 1px solid @primaryBlue;

//     & .checkbox-inner {
//       position: absolute;
//       top: 2px;
//       left: 2px;
//       background-color: @primaryBlue;
//       width: 8px;
//       height: 8px;
//     }
//   }
// }

</style>
