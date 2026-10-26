"use client";
import { useState } from "react";
import type { Exercise } from "@/lib/types";

// Two movement photos per exercise: public/images/<exercise id>-1.jpg (start) and -2.jpg (finish).
// A frame shows a placeholder until its photo exists.
function Frame({ ex, n, label }: { ex: Exercise; n: number; label: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={"frame" + (loaded ? "" : " missing")}>
      {/* Plain <img>: the static export has no image optimisation server. */}
      <img
        src={"/images/" + encodeURIComponent(ex.id) + "-" + n + ".jpg"}
        alt={ex.name + ", " + label.toLowerCase() + " position"}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function MovePhotos({ ex }: { ex: Exercise }) {
  return (
    <div className="moves">
      <Frame ex={ex} n={1} label="Start" />
      <Frame ex={ex} n={2} label="Finish" />
    </div>
  );
}

// Muscle diagram per exercise: public/images/mdiagrams/<exercise id>.png.
// Hidden if it fails to load, so exercises without one show nothing.
export function MuscleDiagram({ ex }: { ex: Exercise }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure className="mdiagram">
      <img
        src={"/images/mdiagrams/" + encodeURIComponent(ex.id) + ".png"}
        alt={"Muscles worked by " + ex.name.toLowerCase()}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <figcaption>Muscles worked</figcaption>
    </figure>
  );
}
