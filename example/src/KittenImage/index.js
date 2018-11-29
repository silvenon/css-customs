import React from 'react'
import { Cloudinary } from 'cloudinary-core'
import { customMedia, customProperties } from '../global.css'
import styles from './style.module.css'

const cl = new Cloudinary({ cloud_name: 'demo', secure: true })

const url = {
  200: cl.url('kitten', { crop: 'scale', width: 200 }),
  300: cl.url('kitten', { crop: 'scale', width: 300 }),
  400: cl.url('kitten', { crop: 'scale', width: 400 }),
  600: cl.url('kitten', { crop: 'scale', width: 600 }),
}

const KittenImage = () => (
  <img
    className={styles.image}
    alt="a kitten"
    src={url[200]}
    srcSet={`
      ${url[200]} 200w,
      ${url[300]} 300w,
      ${url[400]} 400w,
      ${url[600]} 600w
    `}
    sizes={`
      ${customMedia['--narrow-window']} ${
      customProperties['--image-width-narrow']
    },
      ${customProperties['--image-width']}
    `}
  />
)

export default KittenImage
