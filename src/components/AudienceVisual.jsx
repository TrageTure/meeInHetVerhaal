import React from 'react'
import { getCategoryConfig } from '../utils'

export function AudienceVisual({ audiences = [], fallbackImage, className = '' }) {
  const visualAudiences = audiences
    .slice(0, 3)
    .map((audience) => ({
      name: audience.name,
      image: audience.imagePath || audience.image_path || getCategoryConfig(audience.name).image,
    }))
    .filter((audience) => audience.image)

  const layers = visualAudiences.length > 0
    ? visualAudiences
    : [{ name: 'Doelgroep', image: fallbackImage }]

  return (
    <span className={`${className} audience-visual audience-count-${layers.length}`} aria-hidden="true">
      {layers.map((audience, index) => (
        <img
          className={`audience-visual-layer audience-layer-${index + 1}`}
          src={audience.image}
          alt=""
          key={`${audience.name}-${index}`}
        />
      ))}
    </span>
  )
}
