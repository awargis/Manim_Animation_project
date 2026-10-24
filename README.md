# Manim Animation Project

A ready-to-run starter for creating polished educational physics and mathematics animations with [Manim Community](https://www.manim.community/).

## Run locally or in Google Colab

```bash
python -m pip install -r requirements.txt
manim -pqh main.py IrodovQuestionDemo
```

The rendered MP4 is written under `media/videos/main/1080p60/` (quality depends on the selected render flag). For a faster preview, use `-pql` instead of `-pqh`.

## Render on GitHub Actions

Open **Actions → Render Manim video → Run workflow**. When it finishes, download the `manim-render` artifact from the workflow run. The workflow does not commit generated video files into the repository.

## Publish the project page

The included GitHub Pages workflow publishes the `docs/` folder whenever changes are pushed to `main`. In the repository settings, ensure **Pages → Build and deployment → Source** is set to **GitHub Actions**. After the first successful deployment, the site will be available at:

`https://awargis.github.io/Manim_Animation_project/`

## Customize the animation

Edit `QUESTION_TITLE`, `QUESTION_TEXT`, and the scene in `main.py`. This sample demonstrates a particle moving on a circular path under a central force. Replace the illustrative physics with the exact Irodov question statement and validated solution before publishing an educational episode.

## Notes

- Manim renders video; GitHub Pages hosts the static project page. They are separate workflows.
- The starter scene is illustrative and is not a solution to a specific Irodov problem.
- Use only question text and assets you have permission to reproduce.
