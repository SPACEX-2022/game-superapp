import type { PlasmoContentScript } from "plasmo"
import { createRoot } from "react-dom/client"

// 指定匹配的页面
export const config: PlasmoContentScript = {
  matches: ["https://superapp.tcmppapi.com/superapp/miniGame/list"]
}

// 防抖函数，避免频繁执行
function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// 用于向表格中注入"添加到游戏库"按钮
function injectAddButton() {
  // 查找表格行
  const tableRows = document.querySelectorAll('.tea.app-tcmpp-table__box tbody tr')
  
  if (!tableRows || tableRows.length === 0) return // 如果没有找到表格行，直接返回
  
  // 遍历表格行
  tableRows.forEach((row) => {
    // 检查行是否已经有添加按钮
    if (row.querySelector('.tea.app-tcmpp-btn--link.game-superapp-btn')) {
      return
    }
    
    // 获取操作列(通常是最后一列)
    const actionCell = row.querySelector('td:last-child>div')
    if (!actionCell) return
    
    // 创建按钮
    const addButton = document.createElement('button')
    addButton.className = 'tea app-tcmpp-btn tea app-tcmpp-btn--link game-superapp-btn'
    addButton.textContent = '添加到游戏库'
    
    // 获取行数据
    const cellNodes = row.querySelectorAll('td')
    const rowData = {}
    
    // 收集表格行中可能包含的数据
    cellNodes.forEach((cell, index) => {
      const header = document.querySelector(`.tea.app-tcmpp-table__box thead th:nth-child(${index + 1})`)
      if (header) {
        const headerText = header.textContent.trim()
        rowData[headerText] = cell.textContent.trim()
      }
    })
    
    // 点击按钮时的处理
    addButton.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // 发送消息到扩展
      chrome.runtime.sendMessage({
        type: "OPEN_GAME_FORM",
        data: rowData
      })
    })
    
    // 添加按钮到单元格
    actionCell.prepend(addButton)
  })
}

// 使用防抖处理的注入函数
const debouncedInject = debounce(injectAddButton, 300)

// 监听DOM变化以处理动态加载的表格
function observeTableChanges() {
  // 找到表格容器，而不是监听整个body
  const tableContainer = document.querySelector('.tea.app-tcmpp-table__box')
  console.log('tableContainer', tableContainer)
  
  if (!tableContainer) {
    // 如果还没有表格容器，设置一个定时器稍后尝试
    setTimeout(observeTableChanges, 500)
    return
  }
  
  const observer = new MutationObserver((mutations) => {
    // 只在真正需要时调用注入函数
    let shouldInject = false
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && 
          (mutation.target.nodeName === 'TBODY' || 
           (mutation.target instanceof Element && 
            mutation.target.classList.contains('app-tcmpp-table__box')))) {
        shouldInject = true
        break
      }
    }
    
    if (shouldInject) {
      debouncedInject()
    }
  })
  
  // 只监听表格容器的变化，而不是整个document
  observer.observe(tableContainer, {
    childList: true,
    subtree: true
  })
  
  // 初始执行一次注入
  debouncedInject()
}

// 初始执行注入
const init = () => {
  // 如果已经加载完成，直接执行
  if (document.readyState !== 'loading') {
    debouncedInject()
    observeTableChanges()
  } else {
    // 否则等待DOM加载完成
    document.addEventListener('DOMContentLoaded', () => {
      debouncedInject()
      observeTableChanges()
    })
  }
}

init() 