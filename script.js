function getBackgroundImageDimensions(el) {
	var regex = /(url\()(.*)(\))/g;
	var styles = window.getComputedStyle(el);
	var backgroundimagestring = styles.backgroundImage;
	var imgUrl = regex.exec(backgroundimagestring)[2];
	var img = new Image();
	img.src = imgUrl;
	return {w:img.width,h:img.height};
}
var imgFromUrl = function(imageurlstring) {

	console.log(imageurlstring);
	console.log(regex.exec(imageurlstring)[2]);
	return regex.exec(imageurlstring)[2];
};
function resize(e) {
	var w = window.innerWidth,
	h = window.innerHeight;
	var minW = 320,
	maxW = 980;
	w = w <= minW ? minW : w >= maxW ? maxW : w;

	console.log("setting body size");
	document.body.style.width=w+"px";
	document.body.style.height=h+"px";

	var banner = document.querySelector("#banner");
	var bannerStyles = window.getComputedStyle(banner);
	var bD = getBackgroundImageDimensions(banner);
	//banner.style.backgroundSize=Math.floor(w/bD.w*100)+"% 100px";
	banner.style.backgroundSize="100%";

	var wsLog = document.querySelector("#windowSize");
	wsLog.innerHTML = w+"x"+h;

	wsLog.innerHTML = Math.floor(w/bD.w*100) + ":"+ w + "x" + bD.h + ":" + h
}
document.body.onload = resize;
document.body.onresize = resize;

