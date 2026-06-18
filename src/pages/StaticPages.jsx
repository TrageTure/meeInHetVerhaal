import React from 'react'
import { homeTiles } from '../data'

export function Home() {
  return (
    <>
      <section className="home-hero section-bg">
        <div className="page-width home-hero-grid">
          <a className="home-portrait" href="/over-jorane" aria-label="Lees meer over Jorane">
            <img src="/assets/jorane-janssens.png" alt="" />
          </a>
          <div className="home-hero-copy">
            <span>Mee in het verhaal</span>
            <h1>Warme taal voor moeilijke momenten</h1>
            <p>
              Verhalen, handvatten en zachte oefeningen voor kinderen, zorgfiguren, leerkrachten en zorgverleners
              wanneer ziekte, afscheid of rouw dichtbij komt.
            </p>
            <div className="home-actions">
              <a className="primary-home-link" href="/blog/">Naar de blog</a>
              <a className="secondary-home-link" href="/over-jorane">Over Jorane</a>
            </div>
          </div>
        </div>
      </section>
      <section className="tile-section home-audience-section section-bg">
        <div className="page-width">
          <div className="home-section-heading">
            <h2>Waar wil je mee starten?</h2>
          </div>
          <div className="home-grid">
            {homeTiles.map((tile) => (
              <a className="home-tile" href={tile.path} key={tile.path} aria-label={tile.alt}>
                <img src={tile.image} alt="" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function About() {
  return (
    <section className="about-section section-bg">
      <div className="page-width about-simple">
        <div className="about-portrait">
          <img src="/assets/jorane-janssens.png" alt="" />
        </div>
        <article className="about-copy">
          <span>Over Jorane</span>
          <h1>Ruimte maken voor wat moeilijk te zeggen is</h1>
          <p>
            Met Mee in het verhaal wil Jorane kinderen en de mensen rondom hen helpen om taal, rust en houvast te vinden
            wanneer ziekte, afscheid of rouw dichtbij komt.
          </p>
          <p>
            Moeilijke gebeurtenissen komen vaak met grote vragen. Wat zeg je tegen een kind? Hoe blijf je eerlijk zonder te
            overspoelen? En hoe geef je ruimte aan verdriet, verwarring of stilte?
          </p>
          <p>
            Deze plek verzamelt zachte woorden, concrete handvatten en kleine oefeningen voor zorgfiguren, leerkrachten en
            zorgverleners die kinderen nabij willen blijven op kwetsbare momenten.
          </p>
          <a className="primary-home-link" href="/blog/">Naar de blog</a>
        </article>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="contact-section section-bg">
      <div className="page-width">
        <div className="wave-crop">
          <img src="/assets/golf-c3d8cb.png" alt="" />
        </div>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Jouw naam *
            <input type="text" name="naam" autoComplete="name" />
          </label>
          <label>
            Jouw e-mailadres *
            <input type="email" name="email" autoComplete="email" />
          </label>
          <label>
            Jouw bericht *
            <textarea name="bericht" />
          </label>
          <label className="marketing">
            <input type="checkbox" name="marketing" />
            <span>Ja, ik ontvang graag nieuws over aanbiedingen.</span>
          </label>
          <div className="captcha-row">
            <span className="shield">♡</span>
            <a href="https://friendlycaptcha.com" target="_blank" rel="noreferrer">Friendly Captcha</a>
          </div>
          <button className="submit-button" type="submit">Verzenden</button>
        </form>
      </div>
    </section>
  )
}
