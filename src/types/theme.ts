// src/types/theme.ts
// Tipo compartilhado para tema usado em styled components

export interface Theme {
  colors?: {
    primary?: string;
    secondary?: string;
    text?:
      | {
          primary?: string;
          secondary?: string;
          dark?: string;
          medium?: string;
          light?: string;
        }
      | string;
    surface?:
      | string
      | {
          primary?: string;
          secondary?: string;
        };
    background?:
      | string
      | {
          primary?: string;
          secondary?: string;
        };
    border?:
      | string
      | {
          light?: string;
          primary?: string;
          focus?: string;
        };
    shadow?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    status?: {
      success?:
        | string
        | {
            background?: string;
            text?: string;
          };
      warning?:
        | string
        | {
            background?: string;
            text?: string;
          };
      error?:
        | string
        | {
            background?: string;
            text?: string;
          };
      info?:
        | string
        | {
            background?: string;
            text?: string;
          };
    };
    navigation?: {
      active?: string;
      hover?: string;
    };
    button?: {
      primary?: {
        background?: string;
        text?: string;
        hover?: string;
      };
      secondary?: {
        background?: string;
        text?: string;
        hover?: string;
      };
      danger?: {
        background?: string;
        text?: string;
        hover?: string;
      };
    };
  };
}
