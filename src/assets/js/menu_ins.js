// 获取要插入div元素的父元素
let menuBox = document.querySelector('.menu-box')

// 定义一个数组，存储不同的网址和文本
let data = [
  { url: 'https://blog.aqhours.cn', text: '博客', icon: 'czs-paper' },
  {
    url: 'https://blog.aqhours.cn/index.php/start-page.html',
    text: '关于',
    icon: 'czs-headset',
  },
  {
    url: 'https://messagewall.aqhours.cn',
    text: '留言',
    icon: 'czs-comment',
  },
  {
    url: 'http://easybook.aqhours.cn',
    text: '相册',
    icon: 'czs-read',
  },
]

let menuHTML = ''

for (let i = 0; i < data.length; i++) {
  menuHTML += `<a class="menu" onclick="window.location.href='${data[i].url}'">
                  <i class="${data[i].icon}"></i>
                  <p class="menu-text">${data[i].text}</p>
               </a>`
}

menuBox.innerHTML = menuHTML
