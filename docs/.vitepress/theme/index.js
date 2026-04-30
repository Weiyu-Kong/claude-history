import DefaultTheme from 'vitepress/theme'
import './index.css'
import { onMounted } from 'vue'

export default {
  ...DefaultTheme,
  setup() {
    onMounted(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            }
          })
        },
        { threshold: 0.1, rootMargin: '-50px' }
      )

      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el)
      })
    })
  }
}
