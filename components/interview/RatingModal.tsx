import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number) => void;
}

const RatingModal = ({ isOpen, onClose, onSubmit }: RatingModalProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-dark-200 rounded-2xl p-8 max-w-md w-full border border-dark-100">
                <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-primary-100 mb-2">Rate this Interview</h2>
                        <p className="text-primary-300">How would you rate your experience with this interview?</p>
                    </div>
                    
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={cn(
                                    "transition-all duration-200 hover:scale-110",
                                    (hoveredRating || rating) >= star ? "opacity-100" : "opacity-40"
                                )}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Image
                                    src="/star.svg"
                                    alt="star"
                                    width={48}
                                    height={48}
                                    className="size-12"
                                />
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-4 w-full justify-end mt-4">
                        <Button
                            onClick={onClose}
                            className="bg-primary-100 hover:bg-dark-400 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (rating > 0) {
                                    onSubmit(rating);
                                    onClose();
                                }
                            }}
                            className="bg-primary-100 hover:bg-primary-200 text-dark-100 cursor-pointer"
                            disabled={rating === 0}
                        >
                            Submit Rating
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RatingModal