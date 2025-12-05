'use client'

export default function DeleteModal({
  open,
  onClose,
  onDBDelete,
  onBurnDelete,
}: {
  open: boolean
  onClose: () => void
  onDBDelete: () => void
  onBurnDelete: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-3">삭제 옵션 선택</h2>
        <p className="text-gray-600 mb-6 text-sm">
          삭제 후 되돌릴 수 없습니다. 삭제 유형을 선택해주세요.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onDBDelete}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded"
          >
            🗂 DB에서만 삭제
          </button>

          <button
            onClick={onBurnDelete}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
          >
            🔥 NFT 소각 후 삭제
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
