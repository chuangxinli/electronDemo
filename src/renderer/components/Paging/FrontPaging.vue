<template>
  <div>
    <div class="page" @click="changePage({type: 'num', page: currentPage - 1})">上一页</div>
    <div v-for="item in page" class="page" :class="{'curPage': item.page == currentPage && item.type == 'num' }" @click="changePage(item)">
      {{item.page}}
    </div>
    <div class="page" @click="changePage({type: 'num', page: Number(currentPage) + 1})">下一页</div>
    <div class="fLeft mLeft40">
      <span>到第</span>
      <input type="text" v-model="childCurrentPage" class="input" @keyup="inputPageChange()">
      <span>页</span>
      <span @click="skip()">跳转</span>
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
        this.childCurrentPage = this.currentPage
        this.inputPageSize = this.pageSize
        this.totalPage = Math.ceil(this.totalNum / this.pageSize)
        if(this.totalPage < 6){
          let arr = []
          for(let i = 0; i < this.totalPage; i < len){
            arr.push({
              type: 'num',
              page: i + 1
            })
          }
          return arr
        }else if(this.currentPage > 2 && this.totalPage - this.currentPage < 2){
          return [
            {type: 'num', page: 1},
            {type: 'pre5', page: '···'},
            {type: 'num', page: this.totalPage - 3},
            {type: 'num', page: this.totalPage - 2},
            {type: 'num', page: this.totalPage - 1},
            {type: 'num', page: this.totalPage},
          ]
        }else if(this.currentPage < 3 && this.totalPage - this.currentPage > 1){
          return [
            {type: 'num', page: 1},
            {type: 'num', page: 2},
            {type: 'num', page: 3},
            {type: 'num', page: 4},
            {type: 'next5', page: '···'},
            {type: 'num', page: this.totalPage},
          ]
        }else if(this.currentPage > 2 && this.totalPage - this.currentPage > 1){
          return [
            {type: 'num', page: 1},
            {type: 'pre5',page: '···'},
            {type: 'num', page: this.currentPage - 1},
            {type: 'num', page: this.currentPage},
            {type: 'num', page: Number(this.currentPage) + 1},
            {type: 'next5', page: '···'},
            {type: 'num', page: this.totalPage},
          ]
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
      },
      skip(){
        if(this.childCurrentPage){
          this.emitParent(this.childCurrentPage, this.pageSize)
        }
      },
      changePage(item){
        if(item.type === 'pre5'){
          this.emitParent(this.currentPage - 3 > 0 ? this.currentPage - 3 : 1, this.pageSize)
        }else if(item.type === 'num'){
          if(item.page < 1 || item.page > this.totalPage){
            return
          }
          this.emitParent(item.page, this.pageSize)
        }else if(item.type === 'next5'){
          this.emitParent(Number(this.currentPage) + 3 <= this.totalPage ? Number(this.currentPage) + 3 : this.totalPage, this.pageSize)
        }
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