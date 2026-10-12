export const SURVEY_VENCIDA_DEFAULT = {
  title: "ENCUESTA VENCIDA",
  description: "Esta encuesta ya no está disponible",
  showProgress: false,
  showPageNumbers: false,
  showBotton: false,
  pages: [
    {
      name: "page_vencida",
      title: "",
      elements: [
        {
          type: "image",
          name: "icon_vencida",
          src: "/survey_inactive.png",
          alt: "vencida"
        },
        {
          type: "heading",
          name: "vencido_titulo",
          title: "Esta encuesta ya no está disponible"
        },
        {
          type: "description",
          name: "vencido_mensaje",
          title: "",
          description: "El periodo de participación finalizó. Ya no estamos recibiendo respuestas."
        }
      ]
    }
  ]
};