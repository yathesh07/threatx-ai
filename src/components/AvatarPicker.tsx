import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import male1 from "@/assets/avatars/male-1.png";
import male2 from "@/assets/avatars/male-2.png";
import male3 from "@/assets/avatars/male-3.png";
import female1 from "@/assets/avatars/female-1.png";
import female2 from "@/assets/avatars/female-2.png";
import female3 from "@/assets/avatars/female-3.png";

const avatarOptions = {
  male: [
    { src: male1, label: "Young Professional" },
    { src: male2, label: "Bearded Tech" },
    { src: male3, label: "Distinguished" },
  ],
  female: [
    { src: female1, label: "Long Hair" },
    { src: female2, label: "Short Hair" },
    { src: female3, label: "Curly Hair" },
  ],
};

type Gender = "male" | "female";

interface AvatarPickerProps {
  currentAvatar: string | null;
  onSelect: (avatarSrc: string) => void;
  loading?: boolean;
}

const AvatarPicker = ({ currentAvatar, onSelect, loading }: AvatarPickerProps) => {
  const [gender, setGender] = useState<Gender>("male");

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Or choose an avatar</p>
      <div className="flex gap-2">
        {(["male", "female"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border",
              gender === g
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:bg-accent"
            )}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {avatarOptions[gender].map((avatar) => {
          const isSelected = currentAvatar === avatar.src;
          return (
            <button
              key={avatar.label}
              onClick={() => !loading && onSelect(avatar.src)}
              disabled={loading}
              className={cn(
                "relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              )}
              title={avatar.label}
            >
              <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPicker;
