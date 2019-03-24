<template>
  <div>
    <div class="page" @click="changePage(currentPage - 1)">上一页</div>
    <div v-for="item in page" class="page" :class="{'curPage': item == currentPage}" @click="changePage(item)">
      {{item}}
    </div>
    <div class="page" @click="changePage(currentPage + 1)">下一页</div>
    <div class="fLeft mLeft40">
      <input type="text" v-model="childCurrentPage" class="input" @keyup="inputPageChange()">/{{totalPage}}页
    </div>
    <div class="fLeft mLeft40">
      <div class="fLeft">每页的条数 <input type="text" class="input" v-model="inputPageSize" @keyup="inputSize()"></div><div class="fLeft" @click="confirmPageSize()">确定</div>
    </div>
    <div @click="back()">返回</div>
  </div>
</template>

<script>
  export default {
    props: ['totalNum', 'currentPage', 'pageSize'],
    data() {
      return {
        totalPage: '',
        inputPageSize: '',
        childCurrentPage: ''
      }
    },
    computed: {
      page() {
        let arr = []
        this.childCurrentPage = this.currentPage
        this.inputPageSize = this.pageSize
        this.totalPage = Math.ceil(this.totalNum / this.pageSize)
        for (let i = 0; i < this.totalPage; i++) {
          arr.push(i + 1)
        }
        if (this.currentPage < 3) {
          return arr.slice(0, 5)
        } else if (this.currentPage >= 3 && arr.length - this.currentPage >= 2) {
          let start = this.currentPage - 3, end = start + 5
          return arr.slice(start, end)
        } else {
          return arr.slice(arr.length - 5)
        }
      }
    },
    methods: {
      inputSize(){
        this.inputPageSize = String(this.inputPageSize)
        this.inputPageSize = this.inputPageSize.replace(/^0/, '').replace(/\D/g, '')
        if(this.inputPageSize > 99){
          this.inputPageSize = 99
        }
      },
      inputPageChange(){
        this.childCurrentPage = String(this.childCurrentPage)
        this.childCurrentPage = this.childCurrentPage.replace(/^0/, '').replace(/\D/g, '')
        if(this.childCurrentPage > this.totalPage){
          this.childCurrentPage = this.totalPage
        }
        this.emitParent(this.childCurrentPage, this.pageSize)
      },
      changePage(item){
        if (item < 1 || item > this.totalPage) {
          return
        }
        this.emitParent(item, this.pageSize)
      },
      confirmPageSize(){
        this.emitParent(1, this.inputPageSize)
      },
      back(){
        this.$router.go(-1)
      },
      emitParent(currentPage, pageSize){
        this.$emit('childrenChange', currentPage, pageSize)
      }
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