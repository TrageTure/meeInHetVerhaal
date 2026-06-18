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
