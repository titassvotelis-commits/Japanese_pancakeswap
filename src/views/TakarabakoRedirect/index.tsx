import { useEffect } from 'react'

const TAKARABAKO_URL = 'https://takarabako.meme/'

/** Nav uses internal `/takarabako` because uikit top links use react-router `Link`, not raw `<a>`. */
const TakarabakoRedirect = () => {
  useEffect(() => {
    window.location.replace(TAKARABAKO_URL)
  }, [])
  return null
}

export default TakarabakoRedirect
