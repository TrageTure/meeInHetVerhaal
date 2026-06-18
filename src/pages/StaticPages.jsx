import React, { useState } from 'react'
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

export function Contact({ onSubmitContact }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    marketingConsent: false,
    website: '',
  })
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim() && status !== 'sending'

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitForm(event) {
    event.preventDefault()
    if (!canSubmit) return
    if (form.website.trim()) {
      setStatus('success')
      setFeedback('Dankjewel, je bericht is verstuurd.')
      return
    }

    setStatus('sending')
    setFeedback('')
    try {
      await onSubmitContact(form)
      setStatus('success')
      setFeedback('Dankjewel, je bericht is verstuurd.')
      setForm({
        name: '',
        email: '',
        message: '',
        marketingConsent: false,
        website: '',
      })
    } catch (error) {
      setStatus('error')
      setFeedback(error.message || 'Verzenden is niet gelukt. Probeer het straks opnieuw.')
    }
  }

  return (
    <section className="contact-section section-bg">
      <div className="page-width">
        <div className="wave-crop">
          <img src="/assets/golf-c3d8cb.png" alt="" />
        </div>
        <form className="contact-form" onSubmit={submitForm}>
          <label>
            Jouw naam *
            <input
              type="text"
              name="naam"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              required
            />
          </label>
          <label>
            Jouw e-mailadres *
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              required
            />
          </label>
          <label>
            Jouw bericht *
            <textarea
              name="bericht"
              value={form.message}
              onChange={(event) => updateForm('message', event.target.value)}
              required
            />
          </label>
          <label className="contact-honeypot" aria-hidden="true">
            Website
            <input
              type="text"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              value={form.website}
              onChange={(event) => updateForm('website', event.target.value)}
            />
          </label>
          <label className="marketing">
            <input
              type="checkbox"
              name="marketing"
              checked={form.marketingConsent}
              onChange={(event) => updateForm('marketingConsent', event.target.checked)}
            />
            <span>Ja, ik ontvang graag updates van Mee in het verhaal.</span>
          </label>
          {feedback && <p className={`contact-feedback ${status === 'error' ? 'error' : 'success'}`}>{feedback}</p>}
          <button className="submit-button" type="submit" disabled={!canSubmit}>
            {status === 'sending' ? 'Verzenden...' : 'Verzenden'}
          </button>
        </form>
      </div>
    </section>
  )
}

export function Privacy() {
  return (
    <section className="privacy-section section-bg">
      <div className="page-width privacy-page">
        <span>Privacy</span>
        <h1>Privacyverklaring</h1>
        <p className="privacy-intro">
          Mee in het verhaal gaat zorgvuldig om met persoonsgegevens. Op deze pagina lees je welke gegevens verwerkt
          worden, waarom dat gebeurt en welke rechten je hebt.
        </p>

        <article>
          <h2>Welke gegevens verwerken we?</h2>
          <p>
            Wanneer je het contactformulier gebruikt, verwerken we je naam, e-mailadres, bericht en je keuze rond updates.
            Deze gegevens zijn nodig om je vraag te kunnen ontvangen en beantwoorden.
          </p>
          <p>
            Wanneer je als beheerder inlogt op de beheeromgeving, verwerkt Supabase gegevens die nodig zijn voor
            authenticatie en het beheren van blogartikels en filters.
          </p>
        </article>

        <article>
          <h2>Waarom verwerken we deze gegevens?</h2>
          <p>We gebruiken persoonsgegevens alleen voor deze doelen:</p>
          <ul>
            <li>om contactvragen te ontvangen en te beantwoorden;</li>
            <li>om gevraagde updates te kunnen opvolgen wanneer je daar zelf voor kiest;</li>
            <li>om de blog en beheeromgeving technisch te laten werken;</li>
            <li>om misbruik of spam te beperken.</li>
          </ul>
        </article>

        <article>
          <h2>Welke diensten gebruiken we?</h2>
          <p>
            Het contactformulier wordt verwerkt via FormSubmit. FormSubmit stuurt de inhoud van het formulier door naar
            de mailbox van Mee in het verhaal. Antwoorden verlopen daarna gewoon via e-mail.
          </p>
          <p>
            Blogdata en de beheeromgeving gebruiken Supabase. Supabase bewaart de gegevens die nodig zijn om artikels,
            filters en beheerlogin te laten werken.
          </p>
        </article>

        <article>
          <h2>Cookies</h2>
          <p>
            Deze site gebruikt zelf geen analytische of marketingcookies. Daarom tonen we geen cookiebanner. Alleen
            technisch noodzakelijke opslag of gegevensverwerking kan plaatsvinden wanneer dat nodig is om de site of de
            beheeromgeving te laten werken.
          </p>
        </article>

        <article>
          <h2>Hoe lang bewaren we gegevens?</h2>
          <p>
            Contactberichten worden bewaard zolang nodig is om je vraag te behandelen of zolang dat praktisch nodig is
            voor opvolging. Je kan altijd vragen om je gegevens te laten verwijderen.
          </p>
        </article>

        <article>
          <h2>Jouw rechten</h2>
          <p>
            Je kan vragen om je gegevens in te kijken, te verbeteren of te verwijderen. Je kan ook bezwaar maken tegen
            verdere verwerking wanneer daar een geldige reden voor is.
          </p>
          <p>
            Wil je een privacyvraag stellen of je gegevens laten aanpassen of verwijderen? Neem contact op via de
            contactpagina.
          </p>
        </article>

        <article>
          <h2>Wijzigingen</h2>
          <p>
            Deze privacyverklaring kan worden aangepast wanneer de website of gebruikte diensten veranderen. Laatste
            update: 18 juni 2026.
          </p>
        </article>
      </div>
    </section>
  )
}
