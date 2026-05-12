<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-04-18 21:18:48
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-05-07 20:05:49
 * @FilePath: \test\Template\Default\_Common\MusicPlayer.php
 * @Description: 重构版音乐播放器 - 解决所有音乐播放器问题
 */
if(!defined("AdminPHP")) exit('<h1 style="color:red">Bad Reuest!</h1> <hr /> Powered By Xlch-AdminPHP');
?>

<link rel="stylesheet" href="/assets/css/index.bundle.css">

<style>
#CorePlayer {
    z-index: 2 !important;
}
#CoreWrapper {
    z-index: 2 !important;
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
}
#CoreWrapper.hidden.right {
    transform: translate(calc(100% - 50px)) !important;
}
#CoreWrapper.hidden.left {
    transform: translate(calc(-100% + 50px)) !important;
}
#CoreWrapper .left_arrow,
#CoreWrapper .right_arrow {
    width: 80px !important;
}
#CoreWrapper.right {
    transform: translate(0);
}
#CoreWrapper.left {
    transform: translate(0);
}
</style>

<script src="/assets/js/music-player.js?v=<?php echo time();?>"></script>