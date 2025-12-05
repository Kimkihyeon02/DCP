export function ipfsToGateway(uri?: string | null): string {
  if (!uri) return '/placeholder.png'
  // ipfs:// 형태면
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
  }
  // CID(Qm... 또는 bafy...)만 들어온 경우
  if (/^(Qm|bafy)[1-9A-HJ-NP-Za-km-z]{44,}$/.test(uri)) {
    return `https://gateway.pinata.cloud/ipfs/${uri}`
  }
  // 혹시 URL이면 그대로
  if (uri.startsWith('http')) return uri
  // 기본값
  return '/placeholder.png'
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
