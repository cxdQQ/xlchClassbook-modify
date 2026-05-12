<?php
if(!defined("AdminPHP")) exit('<h1 style="color:red">Bad Reuest!</h1> <hr /> Powered By Xlch-AdminPHP');

$musicConfig = [
    'API_URL' => 'https://wyyapi.cxdqq.top',//使用https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced项目
    'LINK_API_URL' => 'https://wyyapi.cxdqq.top/song/url/v1',
    'COOKIE' => 'cookie未配置请在\Template\Default\_Common\MusicConfig.php中配置，MUSIC_U开头',//可能有泄露风险
    'TIMEOUT' => 15000,
    'RETRY_COUNT' => 3,
    'DEBUG' => false
];
?>
<script>
window.MUSIC_CONFIG = <?php echo json_encode($musicConfig, JSON_UNESCAPED_SLASHES); ?>;
</script>
