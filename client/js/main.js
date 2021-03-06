var a, b, c, d;
var tArr = [
			// [-10,8,3,4,10,6,7,4, 8],
			// [1,8,3,4,1,6,1,4, 1],
			// [1,8,3,4,1,6,1,4, 1],
			// [1,8,3,4,1,6,1,4, 1],
			// [1,8,3,4,1,6,1,4, 1],
			// [1,8,3,4,1,6,1,4, 1],
			[],
			[],
			[],
			[],
			[],
			[],
		];
var time = [];
var clr;
var input = document.querySelectorAll("input");

function setup()
{
	var canvas = createCanvas(1300, 700);
	canvas.id("canvas")

	//test
	// var acceptStr = "00:00:12 -1 -200 3 4 10 -600\n00:00:15 6 5 4 4 5 6\n00:00:18 2 5 -4 -0030 2 -1000\n";
	// parseStr(acceptStr);
	// console.log(tArr);

	clr = [
		color(0,0,255),
		color(0,255,0),
		color(255,255,0),
		color(255,0,255),
		color(0,255,255),
		color(0,0,0)
	];
	var label = document.querySelectorAll("label");
	for (var i = 0; i < label.length; i++)
		label[i].style.background = "rgb(" + clr[i].levels[0] + "," +
								clr[i].levels[1] + "," +
								clr[i].levels[2] + ")";
	document.getElementById("all-graph").onclick = function()
	{
		tArr = [
			[],
			[],
			[],
			[],
			[],
			[],
		];
		httpGet("http://192.168.0.148:8000/get-data-all", "text", parseStr, function()
		{
			console.log("Not msg whith server")
		});
	};
};

function draw()
{
	background(255);

	a = min(time);
	b = max(time);
	c = min(tArr[0]);
	d = max(tArr[0]);
	for (var i = 1; i < tArr.length; i++)
	{
		if (d < max(tArr[i]))
			d = max(tArr[i]);
		if (c > min(tArr[i]))
			c = min(tArr[i]);
	}

	for (var i = 0; i < tArr.length; i++)
		if (input[i].checked)
			plot2D(time, tArr[i], clr[i]);
	parametrText();
};

function parseStr(str)
{
	for (var i = 0, tmp; i < str.length; i++)
	{
		tmp = +str[i++];
		if (str[i] !== ":")
		{
			tmp *= 10;
			tmp += +str[i++];
		}
		time.push(tmp * 60 * 60);

		i++;tmp = +str[i++];
		if (str[i] !== ":")
		{
			tmp *= 10;
			tmp += +str[i++];
		}
		time[time.length-1] += tmp * 60;

		i++;tmp = +str[i++];
		if (str[i] !== ":" && str[i] !== " ")
		{
			tmp *= 10;
			tmp += +str[i++];
		}
		time[time.length-1] += tmp;

		i++; //чтобы сдвинуться с пробела на цифру
		for (var j = 0, Yn; j < 6; j++, i++)
		{
			if (str[i] === "-")
			{
				Yn = true;
				i++;
			}
			else
				Yn = false
			for (tmp = +str[i++]; (str[i] !== "\n") && (str[i] !== " "); i++)
			{
				tmp *= 10;
				tmp += +str[i];
			}
			if (Yn) tmp *= -1;
			tArr[j].push(tmp);
		}
	}
	console.log("get accept");
};

function plot2D(xArr, yArr, clr)
{
	xArr = xArr || [];
	yArr = yArr || [];
	clr = clr || color(0,0,0);

	var mappingX = function(x)
	{
		return (x - a) / (b - a) * width;
	}

	var mappingY = function(y)
	{
		return height - (y - c) / (d - c) * height;
	}
	stroke(clr);
	for (var i = 0; i < xArr.length-1; i++)
	{
		line(
			mappingX(xArr[i]),
			mappingY(yArr[i]),
			mappingX(xArr[i+1]),
			mappingY(yArr[i+1])
			);
	}
};

function parametrText()
{
	var timeTmp = (b - a)/width * mouseX + a;
	var tmp = (d - c)/height * (height - mouseY) + c;
	tmp = tmp.toFixed(2);

	var str1 = "time = " + secToHMS(timeTmp);
	var str2 = "tmp = " + tmp;
	document.getElementById("time").innerHTML = str1;
	document.getElementById("tmp").innerHTML = str2;
	text(str1, mouseX + 5, mouseY);
	text(str2, mouseX + 5, mouseY+15);
	line(mouseX, 0, mouseX, height);
};

function secToHMS(s)
{
	var hour = Math.floor(s/(60*60));
	s -= hour*60*60;
	var minute = Math.floor(s/(60));
	s -= minute*60;
	var sec = s.toFixed(0);

	return hour + ":" +  minute + ":" + sec;
};

setInterval(function ()
{
	httpGet("http://192.168.0.148:8000/get-data-now", "text", parseStr, function()
	{
		console.log("Not msg whith server")
	});
}, 1000);
