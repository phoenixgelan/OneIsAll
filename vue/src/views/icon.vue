<template>
 <!-- <div class="checkbox"> -->
 <!--   <div class="checkbox-inner"></div> -->
 <!-- </div> -->
 <div class="icon" :a="a"></div>
</template>

<script>
  export default {
    name: 'icon',
    data() {
      return {
        a: 1
      }
    }
  }
</script>

<style scoped lang="less">
@primaryBlue: #1890FF;
@primaryWhite: #FFF;
@primaryBlack: rgba(0, 0, 0, .6);

.icon {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid @primaryBlue;
  border-radius: 100%;
  // background: url(a.png);
  // background-position: 14px -2px;
  animation:mymove 1s linear infinite;

  &:before {
    content: '';
    position: absolute;
    width: 14px;
    height: 12px;
    display: inline-block;
    background-color: @primaryWhite;
    top: -1px;
    left: -1px;
    opacity: .8;
    border-radius: 8px 8px 2px 2px / 2px 2px 2px 2px;
  }

  @keyframes mymove {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg)
    }
  }
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
