<?php
if(!defined("AdminPHP")) exit('<h1 style="color:red">Bad Reuest!</h1> <hr /> Powered By Xlch-AdminPHP');
include(T('Default/_Common/MusicConfig'));
?>
<?php include(T('Page/Header'));?>
<div class="pmb-block">
	<form action="<?=U('Page','Option',$Type,'Save')?>" method="post" id="OptionFrom" class="form-horizontal">
		<div class="form-group">
			<label class="col-sm-2 control-label">BGM</label>
			<div class="col-sm-10">
				<div class="fg-line">
					当前音乐：<font id="NowMusic" class="c-blue"><?php if($UInfo['UserData']['Public']['Music']){ echo '加载中...'; } else { echo '未设置'; }?></font>
					<input type="text" onkeydown="if(event.keyCode==13)return false;" class="form-control input-sm" id="MusicSearch" placeholder="输入歌名并回车进行搜索">
					<p id="MusicSearch_tip" style="display:none">请在下方选择音乐：</p>
					<select name="Music" id="MusicSearch_List" style="display:none" class="form-control input-sm">
						<option value="">-- 请选择 --</option>
					</select>
				</div>
			</div>
		</div>
		
		<div class="form-group">
			<label class="col-sm-2 control-label">资料卡背景</label>
			<div class="col-sm-10">
				<?php foreach($UserCardBg as $x=>$row){ ?>
				<div class="radio m-b-15">
					<label>
						<input type="radio" <?=($UInfo['UserData']['Public']['CardBg'] == $x ? 'checked' : '')?> name="CardBg" value="<?=$x?>">
						<i class="input-helper"></i>
						<img src="<?=$row?>" class="img-responsive">
					</label>
				</div>
				<?php } ?>
			</div>
		</div>
		
		<div class="form-group">
			<div class="col-sm-offset-2 col-sm-10">
				<button type="submit" class="btn btn-primary btn-lg btn-block waves-effect">保存</button>
			</div>
		</div>
	</form>
</div>

<script>
const API_URL = window.MUSIC_CONFIG ? window.MUSIC_CONFIG.API_URL : '<?=$musicConfig['API_URL']?>';

$(function(){
	<?php if($UInfo['UserData']['Public']['Music']){ ?>
	$.ajax({
		type: "GET",
		url: API_URL + "/song/detail?ids=<?=$UInfo['UserData']['Public']['Music']?>",
		async: true,
		dataType: "json",
		success: function(data) {
			if(data.code == 200 && data.songs && data.songs.length > 0){
				var song = data.songs[0];
				var artist = song.ar ? song.ar.map(function(a){ return a.name; }).join(',') : '未知歌手';
				$('#NowMusic').html(artist + ' - ' + song.name);
			} else {
				$('#NowMusic').html('获取失败');
			}
		},
		error: function(error) {
			console.error('获取音乐信息失败', error);
			$('#NowMusic').html('加载失败');
		}
	});
	<?php } ?>
	
	$("#MusicSearch").keyup(function(e){
		if(e.keyCode == 13 || e.which == 13){
			var keyword = $("#MusicSearch").val();
			if(keyword.trim() == ''){
				alert('请输入搜索内容');
				return false;
			}
			
			$('#MusicSearch_List').html('<option>搜索中...</option>').show();
			$('#MusicSearch_tip').show();
			
			$.ajax({
				type: "GET",
				url: API_URL + "/search?keywords=" + encodeURIComponent(keyword),
				async: true,
				dataType: "json",
				success: function(data) {
					if(data.code == 200 && data.result && data.result.songs){
						var html = '<option value="">-- 请选择 --</option>';
						for(var x in data.result.songs){
							var song = data.result.songs[x];
							var artist = song.artists ? song.artists.map(function(a){ return a.name; }).join(',') : '未知';
							html += '<option value="' + song.id + '">' + artist + ' - ' + song.name + '</option>';
						}
						$('#MusicSearch_List').html(html).show();
						if(data.result.songs.length == 0){
							$('#MusicSearch_List').html('<option value="">未找到相关歌曲</option>');
						}
					} else {
						$('#MusicSearch_List').html('<option value="">搜索失败，请重试</option>');
					}
				},
				error: function(error) {
					console.error('搜索失败', error);
					$('#MusicSearch_List').html('<option value="">搜索失败，请检查网络</option>');
				}
			});
		}
	});
	
	$('#MusicSearch_List').change(function(){
		var songId = $(this).val();
		if(songId && typeof playMusic === 'function'){
			playMusic(songId);
		}
	});
});
</script>

<style>
#MusicSearch_List {
	margin-top: 10px;
}
</style>

<?php include(T('Page/Footer'));?>