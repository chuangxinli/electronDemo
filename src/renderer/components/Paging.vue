<template>
  <div>
    <div class="paging">
      <div class="inline">
        <div class="page prePage" @click="changePage({type: 'num', page: currentPage - 1})">上一页</div>
        <div v-for="item in page" class="page pageHover" :class="{'curPage': item.page == currentPage && item.type == 'num' }" @click="changePage(item)">
          {{item.page}}
        </div>
        <div class="page nextPage" @click="changePage({type: 'num', page: Number(currentPage) + 1})">下一页</div>
      </div>
      <div class="inline mLeft40 skipPart">
        <span>到第</span>
        <input type="text" v-model="childCurrentPage" class="input" @keyup="inputPageChange()">
        <span>页&nbsp;&nbsp;</span>
        <span @click="skip()" class="skip">跳转</span>
      </div>
      <div class="inline mLeft40">
        <div class="fLeft">每页的条数 <input type="text" class="input" v-model="inputPageSize" @keyup="inputSize()"></div><div class="fLeft skip" @click="confirmPageSize()">确定</div>
      </div>
    </div>
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
          for(let i = 0; i < this.totalPage; i++){
            arr.push({
              type: 'num',
              page: i + 1
            })
          }
          return arr
        }else if(this.currentPage > 2 && this.totalPage - this.currentPage < 3){
          return [
            {type: 'num', page: 1},
            {type: 'pre5', page: '···'},
            {type: 'num', page: this.totalPage - 3},
            {type: 'num', page: this.totalPage - 2},
            {type: 'num', page: this.totalPage - 1},
            {type: 'num', page: this.totalPage},
          ]
        }else if(this.currentPage < 4 && this.totalPage - this.currentPage > 1){
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
      emitParent(currentPage, pageSize){
        this.$emit('childrenChange', currentPage, pageSize)
      }
    }
  }
</script>

<style scoped>
  *{
    font-size: 14px;
  }
  .inline{
    display: inline-block;
  }
  .paging{
    margin: 20px auto;
    overflow: hidden;
    text-align: center;
  }
  .skipPart *{
    float: left;
  }
  .page {
    float: left;
    border: 1px solid #41C0BC;
    padding: 2px 8px;
    margin: 0 10px;
    cursor: pointer;
    border-radius: 14px;
    color: #000000;
  }
  .pageHover:hover{
    background-color: #cdcdcd;
  }
  .skip{
    background-color: #41C0BC;
    width: 60px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    border-radius: 14px;
    cursor: pointer;
    color: #ffffff;
  }
  .skip:hover,.prePage:hover,.nextPage:hover{
    color: #41C0BC;
    background: rgba(187,232,231,1);
    cursor: pointer;
    animation: color-change-delay-blue 0.2s 1 backwards;
  }
  .prePage, .nextPage{
    color: #ffffff;
    background-color: #41C0BC;
  }
  .curPage {
    background-color: #41C0BC;
    color: #ffffff;
  }
  .right{
    float: right;
  }
  .fLeft{
    float: left;
  }

  .mLeft40{
    margin-left: 40px;
  }
  .input {
    box-sizing: border-box;
    width: 50px;
    height: 24px;
    text-align: center;
    outline: none;
    border: 1px solid #41C0BC;
    border-radius: 14px;
    margin: 0 8px;
  }
</style>