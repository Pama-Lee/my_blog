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

  const content = document.createElement('div')
  content.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    position: relative;
    animation: fadeIn 0.2s ease-out;
  `
  content.innerHTML = svg

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
  `
  closeButton.innerHTML = '×'
  content.appendChild(closeButton)

  if (document.documentElement.classList.contains('dark')) {
    content.style.background = '#1f2937'
    closeButton.style.background = '#374151'
    closeButton.style.color = '#9ca3af'
  }

  overlay.appendChild(content)

  const closeOverlay = () => {
    overlay.style.opacity = '0'
    setTimeout(() => overlay.remove(), 200)
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay()
    }
  })

  closeButton.addEventListener('click', closeOverlay)

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay()
    }
  }, { once: true })

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