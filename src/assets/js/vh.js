let isMobile = window.matchMedia('(max-width: 767px)').matches

let imgBoxDivs = document.querySelectorAll('.img-box div')
let mediaQuery = window.matchMedia('(max-width: 1150px)')

function setHeight() {
  if (isMobile) {
    sectionContainer = document.getElementsByClassName('section-container')

    sectionContainer[0].style.height = window.innerHeight + 'px'

    sections = document.querySelectorAll('section')

    sections.forEach((element) => {
      element.style.height = window.innerHeight + 'px'
    })
  }
  if (mediaQuery.matches) {
    // 如果媒体查询匹配，设置高度为视口高度的三分之一
    for (let div of imgBoxDivs) {
      div.style.height = window.innerHeight / 3 + 'px'
    }
  } else {
    // 否则，取消设置的高度
    for (let div of imgBoxDivs) {
      div.style.height = ''
    }
  }
}

// 调用函数来设置初始高度
setHeight()

// 监听窗口大小变化和媒体查询变化，重新设置高度
window.addEventListener('resize', setHeight)
mediaQuery.addEventListener('change', setHeight)
