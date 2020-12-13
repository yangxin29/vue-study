<template>
  <div class="about">
    <div v-for="(item, index) in 16" :key="index" class="content"></div>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'Home'
}
</script>
<style lang="scss" scoped>
.about{
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  border: 1px solid red;
}
.content{
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  margin-right: 15px;
  background: pink;
  border-radius: 4px;
}
</style>