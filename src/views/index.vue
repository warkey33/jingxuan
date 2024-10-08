<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning" style="font-size: 14px">
        	<div style="width:100%;height: 120px;">
	            <div style="padding-top: 1px;">
	            	<p style="color:#178403;">专注于一些Java开发知识，包括基础知识、各大流行框架（Mybatis、Spring、Spring Boot、Spring Cloud等）、数据库（Mysql、Oracle、NoSQL等）、算法与数据结构、面试专题、面试技巧经验、职业规划以及优质开源项目等。邮箱：1787967417@qq.com</p>
	            </div>
          </div>
        </blockquote>

        <hr />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import gzqrcoeUrl from '@/assets/images/gzqrcode.jpg';
import imgUrl from '@/assets/images/donate.png';
export default {
  name: "index",
  data() {
    return {
      // 版本号
      version: "1.0.0",
      imgUrl: imgUrl + '?' + +new Date(),
      gzqrcoeUrl: gzqrcoeUrl + '?' + +new Date(),
    };
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

