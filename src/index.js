import { render } from 'react-dom'
import React, { useState } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import Logo from './Logo'
import './styles.css'


const Card = ( {title, answer}) => {
  return (
    <div>
    <Logo />
    <h2>{title}</h2>
    <p>{answer}</p>
    <a href='https://wwww.google.com' className='cta'>view article</a>
    </div>
  )
}


const divCards = [
  <Card title="301 Redirects" answer="A 301 redirect is an instruction that tells a browser: “The requested page is no longer available at the URL you have, you’ll find it at this new new address”. The browser is then automatically redirected to this new URL and the desired, relocated content is displayed. This happens so quickly users rarely notice a page has been redirected." />,
  <Card title="Ad Retargeting And Remarketing" answer="Retargeting or remarketing refers to any advertising approach that advertises to potential customers after they have had a first encounter with a business’ website. Retargeting is made possible by introducing a tracking device called a “cookie” that assigns a unique ID to a visitor. This allows subsequent ads to be selected based on the visitor’s history." />,
  <Card title="Alt Attributes, Alt Text & Alt Tags" answer="The alt attribute is designed to provide alternative text in the case that the image cannot not be seen. An alt tag is placed in the code surrounding an image and is usually only visible when the image does not or cannot load. The main audience for this was, and still is, the visually impaired." />,
  <Card title="Google Analytics" answer="Google Analytics is a free web service that provides comprehensive statistics and analytical tools for SEO and marketing purposes. Analytics monitors traffic to a website and collects data on how visitors interact with the site. Data available through this service includes user demographics, behaviour and interaction, such as pageviews, bounce rate and average time spent on site. " />,
  <Card title="Anchor Text" answer="Anchor text is the descriptive text of an outbound link. It is clickable, and it’s readable to both the user and to search engines. How this link is described in the anchor text is considered to be one of the top three ranking factors, and remains an integral part of any content marketing or SEO campaign." />,
  <Card title="Bounce Rate" answer="Google Analytics defines bounce rate as the percentage of sessions in which a user left your site from the page through which they entered it, without interacting with it. Not only does a high bounce rate indicate that a business has lost a number of conversion opportunities, but there’s been evidence to suggest that high bounce rates can damage a website’s search visibility." />,

]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = i => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(0deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

const Deck = () => {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, set] = useSprings(divCards.length, i => ({ ...to(i), from: from(i) })) // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    set(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === divCards.length) setTimeout(() => gone.clear() || set(i => to(i)), 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans), backgroundColor: `#000`}} >
            {divCards[i]}
        </animated.div>
    </animated.div>
  ))
}

render(<Deck />, document.getElementById('card-deck'))
