"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const XorshiftRNG = (function() {
		const XorshiftRNG = function(x, y, z, w) {
			if (!(this instanceof XorshiftRNG)) return new XorshiftRNG(x, y, z, w);
			this.x = x >>> 0;
			this.y = y >>> 0;
			this.z = z >>> 0;
			this.w = w >>> 0;
		};
		XorshiftRNG.prototype.randInt = function() {
			const t = (this.x ^ (this.x << 11)) >>> 0;
			this.x = this.y;
			this.y = this.z;
			this.z = this.w;
			this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;
			return this.w;
		};
		return XorshiftRNG;
	})();

	const factorize = function(num) {
		const result = [];
		if (num === 0) return result;
		while (num % 2 === 0) {
			result.push(2);
			num /= 2;
		}
		for (let i = 3; i * i <= num; i += 2) {
			while (num % i === 0) {
				result.push(i);
				num /= i;
			}
		}
		if (num > 1) {
			result.push(num);
		}
		return result;
	};

	const isPrime = function(num) {
		if (num < 2) return false;
		const factors = factorize(num);
		return factors.length === 1;
	}

	const explainSub = function(num, name, fallbackLevel, fallbackMessages) {
		if (isPrime(num)) {
			if (fallbackLevel <= 0) {
				return "\n" + name + "(" + num + "も素数)です!";
			} else {
				const fallbackIndex = fallbackLevel >= fallbackMessages.length ? fallbackMessages.length - 1 : fallbackLevel;
				const fallbackMessage = fallbackMessages[fallbackIndex];
				if (fallbackMessage === "") {
					return "\n" + name + "です!";
				} else {
					return "\n" + name + "(" + fallbackMessage + ")です!";
				}
			}
		} else {
			return "";
		}
	};

	const explain = function(num, fallbackLevel) {
		if ((typeof fallbackLevel) === "undefined") fallbackLevel = 0;
		const factors = factorize(num);
		let explanation = "";
		if (num === 0) {
			explanation += "最小の非負整数です!!";
		} else if (num === 1) {
			explanation += "単数です!!";
		} else if (factors.length === 1) {
			explanation +="素数です!!";
			explanation += explainSub(num + 2, "双子素数", fallbackLevel, ["2足しても素数", "小"]);
			explanation += explainSub(num - 2, "双子素数", fallbackLevel, ["2引いても素数", "大"]);
			explanation += explainSub(num + 4, "いとこ素数", fallbackLevel, ["4足しても素数", "小"]);
			explanation += explainSub(num - 4, "いとこ素数", fallbackLevel, ["4引いても素数", "大"]);
			explanation += explainSub(num + 6, "セクシー素数", fallbackLevel, ["6足しても素数", "小"]);
			explanation += explainSub(num - 6, "セクシー素数", fallbackLevel, ["6引いても素数", "大"]);
			explanation += explainSub(num * 2 + 1, "ソフィー・ジェルマン素数", fallbackLevel, [""]);
			explanation += explainSub((num - num % 2) / 2, "安全素数", fallbackLevel, [""]);
		} else {
			explanation += "" + num + " = " + factors.join("*");
			if (factors.length === 2) {
				explanation += "\n半素数です。";
			} else {
				explanation += "\n合成数です。";
			}
		}
		return explanation;
	};

	const getRandomNNNumber = function(rng) {
		const b = rng.randInt();
		const c = rng.randInt() & 31;
		let mask;
		if      (c <  2) mask = 0xff;
		else if (c <  6) mask = 0xfff;
		else if (c < 10) mask = 0xffff;
		else if (c < 15) mask = 0xfffff;
		else if (c < 20) mask = 0xffffff;
		else if (c < 26) mask = 0xfffffff;
		else             mask = 0x7fffffff;
		return b & mask;
	};

	// ツイート用にコストを計算する
	// ASCIIの文字はコスト1、それ以外はコスト2と(とりあえず)する
	const costCount = function(text) {
		let count = 0;
		for (let i = 0; i < text.length; i++) {
			const c = text.charCodeAt(i);
			if (c <= 0x7f) {
				count += 1;
			} else {
				if (i + 1 < text.length && 0xd800 <= c && c <= 0xdbff) {
					const c2 = text.charCodeAt(i + 1);
					if (0xdc00 <= c2 && c2 <= 0xdfff) {
						count += 2;
						i++;
						continue;
					}
				}
				count += 2;
				continue;
			}
		}
		return count;
	};

	const generateTweet = function(prefix, num, costLimit) {
		if ((typeof costLimit) === "undefined") costLimit = -1;
		let postText = "";
		for (let i = 0; i < 4; i++) {
			postText = prefix + num + "\n" + explain(num, i) + "\n";
			if (costLimit < 0 || costCount(postText) <= costLimit) return postText;
		}
		let postText2 = "";
		for (let i = 0; i < postText.length; i++) {
			let c = postText.charAt(i);
			const cc = postText.charCodeAt(i);
			if (i + 1 < postText.length && 0xd800 <= cc && cc <= 0xdbff) {
				const cc2 = postText.charCodeAt(i + 1);
				if (0xdc00 <= cc2 && cc2 <= 0xdfff) {
					c += postText.charAt(i + 1);
					i++;
				}
			}
			if (costCount(postText2 + c) > costLimit - 3) break;
			postText2 += c;
		}
		return postText2 + "…\n";
	};

	const getNNNumberOfDay = function(date, seed) {
		const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
		const seedLower = seed >>> 0, seedUpper = (seed / 0x100000000) >>> 0;
		const rng = new XorshiftRNG(year, (seedUpper << 8) | month, (~seedUpper << 8) | day, seedLower);
		for (let i = 0; i < 100; i++) rng.randInt();
		return getRandomNNNumber(rng);
	};

	const nnnumberArea = document.getElementById("nnnumber_area");
	const tweetButtonArea = document.getElementById("tweet_button_area");

	const setDisplay = function(prefix, num, url) {
		const displayText = generateTweet(prefix, num);
		// 文字数制限140×2 - 空白とURLのコスト24 - 空白とハッシュタグのコスト16
		const tweetText = generateTweet(prefix, num, 240);

		// 表示を更新する
		while (nnnumberArea.firstChild) {
			nnnumberArea.removeChild(nnnumberArea.firstChild);
		}
		const displayTextLines = displayText.split("\n");
		for (let i = 0; i < displayTextLines.length; i++) {
			if (i > 0) nnnumberArea.appendChild(document.createElement("br"));
			nnnumberArea.appendChild(document.createTextNode(displayTextLines[i]));
		}

		// ツイートボタンを更新する
		while (tweetButtonArea.firstChild) {
			tweetButtonArea.removeChild(tweetButtonArea.firstChild);
		}
		const tweetA = document.createElement("a");
		tweetA.setAttribute("href", "https://twitter.com/share?ref_src=twsrc%5Etfw");
		tweetA.setAttribute("class", "twitter-share-button");
		tweetA.setAttribute("data-text", tweetText);
		tweetA.setAttribute("data-url", url);
		tweetA.setAttribute("data-hashtags", "今日の非負整数");
		tweetA.setAttribute("data-lang", "ja");
		tweetA.setAttribute("data-show-count", "false");
		tweetA.appendChild(document.createTextNode("Tweet"));
		tweetButtonArea.appendChild(tweetA);
		const tweetScript = document.createElement("script");
		tweetScript.setAttribute("async", "");
		tweetScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
		tweetScript.setAttribute("charset", "utf-8");
		tweetButtonArea.appendChild(tweetScript);
	};

	const setDisplayWithDate = function(date) {
		const nnnumber = getNNNumberOfDay(date, 7862398878996585);
		const prefix ="【" + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日の非負整数】";
		setDisplay(prefix, nnnumber, location.href);
	};

	setDisplayWithDate(new Date());
});
