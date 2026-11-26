package br.cofra.studio;

/** Crop coordinates and fit scale without distorting the selected app. */
public final class FrameMath {
  public static float bound(float value, float max) {
    if (Float.isNaN(value) || Float.isInfinite(value)) return 0;
    return Math.max(0, Math.min(max, value));
  }
  public static float[] fit(int sw, int sh, int w, int h, float top, float bottom, float side) {
    if (sw <= 0 || sh <= 0 || w <= 0 || h <= 0) throw new IllegalArgumentException("Dimensões inválidas");
    top=bound(top,.3f);bottom=bound(bottom,.3f);side=bound(side,.2f);
    float source=sw*(1-2*side)/(sh*(1-top-bottom)), target=(float)w/h;
    return new float[]{source>target?1:source/target, source>target?target/source:1, side,bottom,1-side,1-top};
  }
  public static int rgbaToArgb(int pixel) { return (pixel&0xff00ff00)|((pixel>>>16)&0xff)|((pixel&0xff)<<16); }
}
