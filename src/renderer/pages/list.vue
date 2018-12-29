<template>
  <div>
    <FrontPaging :current-page="currentPage" :total-num="totalNum" :page-size="pageSize" @childrenChange="pageChange"></FrontPaging>

    <div class="block">
      <span class="demonstration">When you have more than 7 pages</span>
      <el-pagination
        layout="prev, pager, next"
        :total="80">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import FrontPaging from '@/components/Paging/FrontPaging.vue'
  export default {
    components: {
      FrontPaging
    },
    data() {
      return {
        totalNum: 100,
        pageSize: 10,
        currentPage: 9,
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
      },
      back(){
        this.$router.go(-1)
      },
      pageChange(currentPage, pageSize){
        console.log(currentPage, pageSize)
        this.currentPage = currentPage
        this.pageSize = pageSize
      },
      back(){
        this.$router.go(-1)
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