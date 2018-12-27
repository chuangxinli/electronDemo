<template>
  <div class="paging-wrap" v-if="dataCount">
    <div class="paging clearfix">
      <div class="page-control">
        <el-button size="mini" @click="goPage('up', getPageTips)">上一页</el-button>
        <ul class="paging-button-wrap">
          <li class="paging-button el-button el-button--mini pointer" style="margin-left: 0" :class="{'el-button--primary': page.selected}"
              v-for="(page, index) in getPageTips.PageArr" :key="index"
              @click="goPage(page.pageId, getPageTips)"
          >
            {{page.pageId}}
          </li>
        </ul>
        <el-button size="mini" @click="goPage('down', getPageTips)">下一页</el-button>
      </div>
      <div class="jump-control">
        <input type="text" v-model="jumpPage" class="el-input__inner" @keyup="keyup(jumpPage, 'jumpPage', totalPages)" @keyup.enter="goPage(jumpPage, getPageTips)">
        <p class="text">{{currentPage}}/{{totalPages}}</p>
        <el-button type="primary" size="mini" @click="goPage(jumpPage, getPageTips)">跳转</el-button>
      </div>
      <div class="page-size-control">
        <p class="text">每页显示条数:</p>
        <input type="text" v-model="newPageSize" class="el-input__inner" @keyup="keyup(newPageSize, 'newPageSize', 99)" @keyup.enter="changePageSize(newPageSize)">
        <el-button type="primary" size="mini" @click="changePageSize(newPageSize)">确定</el-button>
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    props: {
      dataCount: Number
    },
    data(){
      return {
        currentPage: 1,
        pageSize: 10,
        newPageSize: '',
        jumpPage: ''
      }
    },
    mounted(){
//      this.$emit('changed', this.currentPage, this.pageSize)
    },
    methods: {
      initCurrentPage(){
        this.currentPage = 1
      },
      goPage(newPage, Page){
        if (!newPage) {
          return
        }
        this.changePage(newPage, Page)
        this.jumpPage = ''
        this.$emit('changed', this.currentPage, this.pageSize)
      },
      changePage(newPage, Page){
        var currentPage = null;
        var prePageID = null;
        if (typeof newPage == "undefined" || newPage == null || newPage == "") {
          currentPage = 1;
        }
        if (typeof newPage == "number") {
          if (newPage == 0) {
            currentPage = 1;
          } else {
            var id = newPage;
            currentPage = id;
          }
        } else {
          if (newPage == "up") {
            for (var i = 0; i < Page.PageArr.length; i++) {
              if (Page.PageArr[i].selected == true) {
                prePageID = Page.PageArr[i].pageId;
              }
            }
            if (prePageID - 1 > 0) {
              currentPage = prePageID - 1;
            } else {
              currentPage = 1;
            }
          } else if (newPage == "down") {
            for (var i = 0; i < Page.PageArr.length; i++) {
              if (Page.PageArr[i].selected == true) {
                prePageID = Page.PageArr[i].pageId;
              }
            }
            if (prePageID + 1 < Page.count + 1) {
              currentPage = prePageID + 1;
            } else {
              currentPage = Page.count;
            }
          } else {
            var text = parseInt(newPage);
            if (/^[0-9]+$/.test(text)) {
              if (text < 1) {
                currentPage = 1;
              } else if (text > Page.count) {
                currentPage = Page.count;
              } else {
                currentPage = text;
              }
            } else {
              currentPage = 1;
            }
          }
        }
        this.currentPage = currentPage;
      },
      keyup(num, str, limitNum){
        if (!this[str]) {
          return
        }
        this[str] = this[str].toString().replace(/[^\d]/g, '');
        if (this[str].length > 1 && this[str].substring(0, 1) == 0) {
          this[str] = this[str].substring(1);
        }
        if (num >= limitNum) {
          this[str] = limitNum;
        }
        if (num < 1) {
          this[str] = '';
        }
      },
      changePageSize(pageSize) {
        if (this.pageSize == pageSize || !pageSize) {
          return;
        } else {
          this.pageSize = pageSize;
          this.currentPage = 1;
          this.newPageSize = ''
          this.$emit('changed', this.currentPage, this.pageSize)
        }
      }
    },
    computed: {
      getPageTips(){
        let currentPage = this.currentPage

        let Page = {}
        let PageObj = {}
        let PageArr = []
        let TotalPages = this.totalPages
        if (typeof TotalPages == "number") {
          if (TotalPages >= 5) {
            Page.PageId = currentPage;
            if (currentPage >= 1 && currentPage <= 3) {
              for (var i = 0; i < 5; i++) {
                PageObj = {};
                PageObj.pageId = i + 1;
                PageArr.push(PageObj);
              }
            } else if (currentPage > 3 && currentPage <= TotalPages - 3) {
              for (var i = currentPage - 3; i < currentPage + 2; i++) {
                PageObj = {};
                PageObj.pageId = i + 1;
                PageArr.push(PageObj);
              }
            } else if (currentPage > TotalPages - 3 && currentPage <= TotalPages) {
              for (var i = TotalPages - 5; i < TotalPages; i++) {
                PageObj = {};
                PageObj.pageId = i + 1;
                PageArr.push(PageObj);
              }
            }
          } else if (TotalPages < 5 && TotalPages > 1) {
            for (var i = 0; i < TotalPages; i++) {
              PageObj = {};
              PageObj.pageId = i + 1;
              PageArr.push(PageObj);
            }
          } else {
            //一页的时候也显示；
            PageObj = {};
            PageObj.pageId = 1;
            PageArr.push(PageObj);
          }
        }

        for (var k = 0; k < PageArr.length; k++) {
          PageArr[k].selected = false;
          if (PageArr[k].pageId == currentPage) {
            PageArr[k].selected = true;
          }
        }

        Page.count = TotalPages;
        Page.PageArr = PageArr;
        return Page;
      },
      totalPages(){
        return Math.ceil(this.dataCount / this.pageSize)
      }
    }
  }
</script>

<style scoped>
.paging-wrap {
  width: 100%;
  font-size: 12px;
  color: #606266;
  padding: 20px 0;
}

.paging {
  width: 800px;
  margin: auto;
  text-align: center;
}

.page-control,
.jump-control,
.page-size-control,
.page-control>*,
.jump-control>*,
.page-size-control>*{
  margin: 0 5px;
}

.paging>*,
.page-control>*,
.jump-control>*,
.page-size-control>*,
.paging-button-wrap>li{
  float: left;
}

.page-size-control{
  float: right;
}

.el-input__inner {
  padding: 0 8px;
  width: 50px;
  height: 28px;
}

.paging-button{
  margin: 0;
  padding: 0;
  text-align: center;
  line-height: 26px;
  width: 35px;
}

.paging-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.paging-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.active {
  background-color: #409EFF;
  color: #fff;
  border: none;
}

.text {
  line-height: 28px;
}
</style>
