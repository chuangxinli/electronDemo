<template>
  <div>
    <div class="page" @click="changePage(currentPage - 1)">上一页</div>
    <div v-for="item in page" class="page" :class="{'curPage': item == currentPage}" @click="changePage(item)">
      {{item}}
    </div>
    <div class="page" @click="changePage(currentPage + 1)">下一页</div>
    <div class="fLeft mLeft40">
      <input type="text" v-model="currentPage" class="input">/{{totalPage}}页
    </div>
    <div class="fLeft mLeft40">
      <div class="fLeft">每页的条数 <input type="text" class="input" v-model="inputPageSize"></div><div class="fLeft" @click="confirmPageSize()">确定</div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        totalNum: 100,
        pageSize: 10,
        currentPage: 9,
        totalPage: '',
        inputPageSize: ''
      }
    },
    computed: {
      page() {
        let arr = []
        this.totalPage = Math.ceil(this.totalNum / this.pageSize)
        for (let i = 0; i < this.totalPage; i++) {
          arr.push(i + 1)
        }
        if (this.currentPage < 5) {
          return arr.slice(0, 5)
        } else if (this.currentPage >= 3 && arr.length - this.currentPage >= 2) {
          return arr.slice(this.currentPage - 3, this.currentPage + 2)
        } else {
          return arr.slice(arr.length - 5)
        }
      }
    },
    methods: {
      changePage(item){
        if (item < 1 || item > this.totalPage) {
          return
        }
        this.currentPage = item
      },
      confirmPageSize(){
        this.currentPage = 1
        this.pageSize = this.inputPageSize
      }
    },
    mounted() {

    }
  }
</script>

<style scoped>
  .page {
    float: left;
    border: 1px solid #4fc08d;
    padding: 2px 8px;
    margin: 0 10px;
    cursor: pointer;
  }

  .curPage {
    background-color: #4fc08d;
  }

  .fLeft{
    float: left;
  }

  .mLeft40{
    margin-left: 40px;
  }
  .input {
    width: 50px;
    height: 26px;
    text-align: center;
  }
</style>