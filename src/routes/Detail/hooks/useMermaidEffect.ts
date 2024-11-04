import { useQuery, useQueryClient } from "@tanstack/react-query"
import mermaid from "mermaid"
import { useEffect, useState } from "react"
import { queryKey } from "src/constants/queryKey"
import useScheme from "src/hooks/useScheme"

const waitForMermaid = (interval = 100, timeout = 5000) => {
  return new Promise<HTMLCollectionOf<Element>>((resolve, reject) => {
    const startTime = Date.now()
    const elements: HTMLCollectionOf<Element> = document.getElementsByClassName("language-mermaid")

    const checkMerMaidCode = () => {
      if (mermaid.render !== undefined && elements.length > 0) {
        resolve(elements)
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`mermaid is not defined within the timeout period.`))
      } else {
        setTimeout(checkMerMaidCode, interval)
      }
    }
    checkMerMaidCode()
  })
}

const createViewerOverlay = (svg: string): HTMLDivElement => {
  // 创建基础遮罩
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
  `

  // 创建可拖动的内容容器
  const content = document.createElement('div')
  content.style.cssText = `
  background: white;
  padding: 40px;
  border-radius: 12px;
  width: 90vw;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: fadeIn 0.2s ease-out;
  transform-origin: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

  // 创建SVG容器
  const svgContainer = document.createElement('div')
  svgContainer.innerHTML = svg
  svgContainer.style.cssText = `
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(1);
  user-select: none;
  cursor: move;
`
  content.appendChild(svgContainer)

  const svgElement = svgContainer.querySelector('svg')
  if (svgElement) {
    svgElement.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      pointer-events: none;
    `
  }

  // 关闭按钮
  const closeButton = document.createElement('button')
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #666;
    z-index: 1;
  `
  closeButton.innerHTML = '×'
  content.appendChild(closeButton)

  // 控制按钮容器
  const controls = document.createElement('div')
  controls.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `

  // 缩放按钮样式
  const buttonStyle = `
    background: #f3f4f6;
    border: none;
    border-radius: 4px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #666;
    transition: background-color 0.2s;
  `

  // 缩小按钮
  const zoomOutButton = document.createElement('button')
  zoomOutButton.style.cssText = buttonStyle
  zoomOutButton.innerHTML = '−'

  // 重置按钮
  const resetButton = document.createElement('button')
  resetButton.style.cssText = buttonStyle
  resetButton.innerHTML = '↺'

  // 放大按钮
  const zoomInButton = document.createElement('button')
  zoomInButton.style.cssText = buttonStyle
  zoomInButton.innerHTML = '+'

  controls.appendChild(zoomOutButton)
  controls.appendChild(resetButton)
  controls.appendChild(zoomInButton)

  overlay.appendChild(content)
  overlay.appendChild(controls)

  // 深色模式支持
  if (document.documentElement.classList.contains('dark')) {
    content.style.background = '#1f2937'
    closeButton.style.background = '#374151'
    closeButton.style.color = '#9ca3af'
    controls.style.background = 'rgba(31, 41, 55, 0.9)'
      ;[zoomOutButton, resetButton, zoomInButton].forEach(button => {
        button.style.background = '#374151'
        button.style.color = '#9ca3af'
      })
  }

  // 变量跟踪状态
  let scale = 1
  let isDragging = false
  let startX = 0
  let startY = 0
  let translateX = 0
  let translateY = 0

  // 缩放功能
  const updateTransform = () => {
    requestAnimationFrame(() => {
      svgContainer.style.transform = `scale(${scale}) translate(${translateX/scale}px, ${translateY/scale}px)`
    })
  }

  zoomInButton.onclick = (e) => {
    e.stopPropagation()
    scale = Math.min(scale + 0.1, 3)
    updateTransform()
  }

  zoomOutButton.onclick = (e) => {
    e.stopPropagation()
    scale = Math.max(scale - 0.1, 0.5)
    updateTransform()
  }

  resetButton.onclick = (e) => {
    e.stopPropagation()
    scale = 1
    translateX = 0
    translateY = 0
    updateTransform()
    svgContainer.style.cursor = 'move'
  }

  // 拖动功能
  svgContainer.onmousedown = (e) => {
    isDragging = true
    startX = e.clientX - translateX
    startY = e.clientY - translateY
    svgContainer.style.cursor = 'grabbing'
  }

  document.onmousemove = (e) => {
    if (!isDragging) return
    translateX = e.clientX - startX
    translateY = e.clientY - startY
    updateTransform()
  }

  document.onmouseup = () => {
    isDragging = false
    svgContainer.style.cursor = 'move'
  }

  // 鼠标滚轮缩放
  content.onwheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    scale = Math.max(0.5, Math.min(3, scale + delta))
    updateTransform()
  }

  // 关闭功能
  const closeOverlay = () => {
    document.onmousemove = null
    document.onmouseup = null
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      document.body.style.cursor = 'default'
    }, 200)
  }

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeOverlay()
    }
  }

  closeButton.onclick = closeOverlay

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay()
    }
  }, { once: true })

  // 动画样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `
  document.head.appendChild(style)

  return overlay
}

const useMermaidEffect = () => {
  const [memoMermaid, setMemoMermaid] = useState<Map<number, string>>(new Map())

  const { data, isFetched } = useQuery({
    queryKey: queryKey.scheme(),
    enabled: false,
  })

  useEffect(() => {
    if (!isFetched) return

    mermaid.initialize({
      startOnLoad: true,
      theme: (data as "dark" | "light") === "dark" ? "dark" : "default",
    })

    if (!document) return

    waitForMermaid()
      .then(async (elements) => {
        const promises = Array.from(elements)
          .filter((element): element is HTMLPreElement => element.tagName === "PRE")
          .map(async (element, i) => {
            if (memoMermaid.get(i) !== undefined) {
              const svg = await mermaid
                .render("mermaid" + i, memoMermaid.get(i) || "")
                .then((res) => res.svg)

              element.animate(
                [
                  { easing: "ease-in", opacity: 0 },
                  { easing: "ease-out", opacity: 1 },
                ],
                { duration: 300, fill: "both" }
              )

              element.innerHTML = svg
              element.style.cursor = 'pointer'
              element.onclick = () => {
                const overlay = createViewerOverlay(svg)
                document.body.appendChild(overlay)
              }
              return
            }

            const svg = await mermaid
              .render("mermaid" + i, element.textContent || "")
              .then((res) => res.svg)

            setMemoMermaid(memoMermaid.set(i, element.textContent ?? ""))
            element.innerHTML = svg
            element.style.cursor = 'pointer'
            element.onclick = () => {
              const overlay = createViewerOverlay(svg)
              document.body.appendChild(overlay)
            }
          })

        await Promise.all(promises)
      })
      .catch((error) => {
        console.warn(error)
      })
  }, [data, isFetched])

  return
}

export default useMermaidEffect