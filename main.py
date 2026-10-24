from manim import *

# Replace these with the exact question number and text for your episode.
QUESTION_TITLE = "IRODOV · PHYSICS IN MOTION"
QUESTION_TEXT = "A particle moves along a circular path.\nExplore the motion, one step at a time."


class IrodovQuestionDemo(Scene):
    """A starter scene for a question-first educational physics animation."""

    def construct(self):
        self.camera.background_color = "#070B14"

        top_rule = Line(LEFT * 6.3, RIGHT * 6.3, color="#26364C").to_edge(UP, buff=0.42)
        brand = Text(QUESTION_TITLE, font_size=18, color="#63E6FF", weight=SEMIBOLD)
        brand.to_edge(UP, buff=0.12)
        self.play(Create(top_rule), FadeIn(brand, shift=DOWN * 0.15), run_time=0.8)

        question = Text(QUESTION_TEXT, font_size=29, line_spacing=0.85, color="#F4F7FB", weight=MEDIUM)
        question.move_to(UP * 1.75)
        pill = RoundedRectangle(corner_radius=0.18, width=2.15, height=0.42,
                                stroke_color="#FFB454", fill_color="#FFB454", fill_opacity=0.12)
        pill.next_to(question, DOWN, buff=0.28)
        pill_text = Text("VISUALISING THE PHYSICS", font_size=11, color="#FFB454", weight=SEMIBOLD)
        pill_text.move_to(pill)
        self.play(Write(question), run_time=1.4)
        self.play(FadeIn(pill), FadeIn(pill_text), run_time=0.5)
        self.wait(0.8)

        # Visual model: a particle orbiting a central point.
        orbit = Circle(radius=1.45, color="#35506D", stroke_width=3).shift(DOWN * 0.75)
        center = Dot(orbit.get_center(), radius=0.09, color="#FFB454")
        center_label = Text("O", font_size=19, color="#FFB454").next_to(center, DOWN, buff=0.12)
        particle = Dot(orbit.point_from_proportion(0.0), radius=0.12, color="#63E6FF")
        glow = Circle(radius=0.22, color="#63E6FF", stroke_width=2).move_to(particle)
        radius_line = always_redraw(lambda: Line(center.get_center(), particle.get_center(),
                                                  color="#FFB454", stroke_width=3))
        radius_label = always_redraw(lambda: MathTex("r", color="#FFB454", font_size=34).move_to(
            (center.get_center() + particle.get_center()) / 2 + LEFT * 0.22 + UP * 0.18))
        self.play(Create(orbit), FadeIn(center), FadeIn(center_label), run_time=0.8)
        self.add(radius_line, radius_label, glow)
        self.play(MoveAlongPath(particle, orbit, rate_func=linear), run_time=4.0)
        self.remove(radius_line, radius_label, glow)

        footer = Text("PAUSE · PREDICT · UNDERSTAND", font_size=16, color="#A9B8CC")
        footer.to_edge(DOWN, buff=0.35)
        self.play(FadeIn(footer), run_time=0.6)
        self.wait(1.5)
