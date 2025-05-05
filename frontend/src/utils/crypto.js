export async function getOrCreateKeyPair() {
  try {
    const storedPrivate = localStorage.getItem('mosaic-private-key')
    const storedPublic = localStorage.getItem('mosaic-public-key')

    if (storedPrivate && storedPublic) {
      const privateKeyJwk = JSON.parse(storedPrivate)
      const publicKeyJwk = JSON.parse(storedPublic)

      if (privateKeyJwk.kty && publicKeyJwk.kty) {
        return { privateKeyJwk, publicKeyJwk }
      }
    }
  } catch (e) {
    console.warn('Invalid keypair in storage. Generating new one.', e)
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  )

  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)

  localStorage.setItem('mosaic-private-key', JSON.stringify(privateKeyJwk))
  localStorage.setItem('mosaic-public-key', JSON.stringify(publicKeyJwk))

  return { privateKeyJwk, publicKeyJwk }
}

export async function signHandle(handle, privateKeyJwk) {
  const data = new TextEncoder().encode(handle)
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const rawSig = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      data
    )
  )

  const encodeDerInt = (bytes) => {
    let i = 0
    while (i < bytes.length - 1 && bytes[i] === 0) i++
    const slice = bytes.slice(i)
    return slice[0] & 0x80
      ? [0x02, slice.length + 1, 0x00, ...slice]
      : [0x02, slice.length, ...slice]
  }

  const r = rawSig.slice(0, rawSig.length / 2)
  const s = rawSig.slice(rawSig.length / 2)
  const rDer = encodeDerInt([...r])
  const sDer = encodeDerInt([...s])
  const derSig = new Uint8Array([
    0x30,
    rDer.length + sDer.length,
    ...rDer,
    ...sDer,
  ])

  return btoa(String.fromCharCode(...derSig))
}

export async function exportPublicKeyHex(publicKeyJwk) {
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    []
  )
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', publicKey))
  return [...raw].map((b) => b.toString(16).padStart(2, '0')).join('')
}
