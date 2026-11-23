import { Link, useParams } from 'react-router-dom'
import FeaturePage from '../components/FeaturePage.jsx'
import { articles } from '../data/articles.js'

export default function ArticlesPage() {
  const { id } = useParams()
  const article = articles.find((item) => item.id === id)
  return <FeaturePage title={id ? article?.title || 'Artigo não encontrado' : 'Leituras para sua jornada'} intro={article?.category}>
    {article ? <article className="community-card article-reader"><p>{article.introduction}</p><h2>Pontos para explorar</h2><ul>{article.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul><p>{article.conclusion}</p><small>Texto adaptado dos modelos editoriais fornecidos ao MamaBloom.</small><Link to="/artigos">Ver todas as leituras</Link></article> : <>{id && <p>Essa leitura não está disponível. Escolha outra abaixo.</p>}<ArticleCards /></>}
  </FeaturePage>
}

export function ArticleCards({ limit }) {
  return <div className="article-cards">{articles.slice(0, limit).map((item) => <Link className="community-card article-card" to={`/artigos/${item.id}`} key={item.id}><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.introduction.slice(0, 100)}…</p><strong>Ler artigo →</strong></Link>)}</div>
}
