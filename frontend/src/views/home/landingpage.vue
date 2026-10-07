<template>
  <v-app class="landing">
    <v-app-bar
      flat
      height="80"
      color="transparent"
      class="px-2 px-md-8 landing-bar"
    >
      <v-icon size="32" color="primary">mdi-storefront</v-icon>
      <span class="ml-3 text-h6 font-weight-bold">Tenliva</span>
      <v-spacer />
      <div class="hidden-sm-and-down d-flex ga-2">
        <v-btn variant="text" @click="scroll('beneficios')">Beneficios</v-btn>
        <v-btn variant="text" @click="scroll('roles')">Roles</v-btn>
        <v-btn variant="text" @click="scroll('seguridad')">Seguridad</v-btn>
      </div>
      <v-btn
        rounded="xl"
        color="primary"
        size="large"
        class="ml-4 px-7 font-weight-bold"
        to="/sign-in"
      >
        Iniciar sesión
      </v-btn>
    </v-app-bar>

    <v-main>
      <!-- HERO PUBLICO -->
      <v-container class="py-16 py-md-24">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-chip
              color="primary"
              variant="tonal"
              class="mb-4 font-weight-bold"
            >
              Nuevo • Sistema privado para tu empresa.
            </v-chip>
            <h1
              class="text-h3 text-md-h2 font-weight-black"
              style="line-height: 0.95"
            >
              Controla tu negocio.<br />
              Cada persona ve<br />
              <span class="text-primary">solo lo que debe ver.</span>
            </h1>
            <p
              class="text-h6 text-grey-darken-1 mt-6 font-weight-regular"
              style="max-width: 520px"
            >
              Ya no más Excel, WhatsApp y confusiones. Asigna permisos por rol,
              separa tus sucursales o empresas, y ten todo seguro y auditado.
              Diseñado para crecer sin desorden.
            </p>
            <div class="d-flex ga-4 mt-8 flex-wrap">
              <v-btn
                size="x-large"
                rounded="xl"
                color="primary"
                class="px-8"
                to="/sign-in"
                elevation="2"
              >
                Entrar a mi cuenta
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                size="x-large"
                rounded="xl"
                variant="outlined"
                class="px-8"
                @click="scroll('roles')"
              >
                Cómo funciona
              </v-btn>
            </div>

            <div class="d-flex align-center ga-2 mt-8 text-grey-darken-1">
              <v-icon color="green">mdi-check-circle</v-icon> Sin instalaciones
              <v-icon color="green" class="ml-4">mdi-check-circle</v-icon> 100%
              en la nube
              <v-icon color="green" class="ml-4">mdi-check-circle</v-icon>
              Soporte incluido
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-card rounded="xl" elevation="10" class="pa-3">
              <v-img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
                rounded="xl"
                height="420"
                cover
              />
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- BENEFICIOS -->
      <div id="beneficios" class="py-16 bg-grey-lighten-5">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-bold">
              Un sistema que sí ordena tu empresa
            </h2>
            <p class="text-grey-darken-1 mt-2">
              No es solo un software, es tranquilidad.
            </p>
          </div>
          <v-row>
            <v-col cols="12" md="4">
              <v-card rounded="xl" flat class="pa-8 h-100 text-center">
                <v-avatar size="64" color="primary" class="mb-4"
                  ><v-icon size="32">mdi-account-lock</v-icon></v-avatar
                >
                <h3 class="font-weight-bold">Permisos por Roles</h3>
                <p class="text-grey mt-2">
                  Crea roles como Administrador, Vendedor, Cajero. Tú decides
                  qué puede ver y hacer cada uno. Nadie ve lo que no le toca.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card rounded="xl" flat class="pa-8 h-100 text-center">
                <v-avatar size="64" color="primary" class="mb-4"
                  ><v-icon size="32">mdi-shield-lock-outline</v-icon></v-avatar
                >
                <h3 class="font-weight-bold">Sistema Privado y Seguro</h3>
                <p class="text-grey mt-2">
                  Un solo sistema, cada empresa totalmente independiente. Tus
                  datos son solo tuyos, con aislamiento total y seguridad
                  garantizada.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card rounded="xl" flat class="pa-8 h-100 text-center">
                <v-avatar size="64" color="primary" class="mb-4"
                  ><v-icon size="32">mdi-chart-box</v-icon></v-avatar
                >
                <h3 class="font-weight-bold">Todo Auditado</h3>
                <p class="text-grey mt-2">
                  Sabes quién hizo qué y cuándo. Si un producto cambió de
                  precio, sabes quién lo hizo. Control total.
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- ROLES EJEMPLO -->
      <v-container id="roles" class="py-16">
        <v-row align="center">
          <v-col cols="12" md="6">
            <h2 class="text-h4 font-weight-bold">
              Crea el rol una vez, funciona para siempre
            </h2>
            <p class="text-grey-darken-1 mt-4">
              ¿Nuevo cargo? Lo creas en 1 minuto, le asignas permisos y listo.
            </p>
            <v-list class="mt-6 bg-transparent">
              <v-list-item
                ><template #prepend
                  ><v-icon color="green">mdi-check</v-icon></template
                >Admin ve todo</v-list-item
              >
              <v-list-item
                ><template #prepend
                  ><v-icon color="green">mdi-check</v-icon></template
                >Vendedor solo ve ventas y clientes</v-list-item
              >
              <v-list-item
                ><template #prepend
                  ><v-icon color="green">mdi-check</v-icon></template
                >Bodega solo ve inventario</v-list-item
              >
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-card rounded="xl" elevation="6" class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h4 class="font-weight-bold">Roles de tu empresa</h4>
                <v-chip color="green" size="small">Activo</v-chip>
              </div>
              <v-card
                variant="outlined"
                rounded="lg"
                class="pa-4 mb-3 d-flex justify-space-between"
                ><span>👑 Administrador</span
                ><span class="text-primary">Todos los permisos</span></v-card
              >
              <v-card
                variant="outlined"
                rounded="lg"
                class="pa-4 mb-3 d-flex justify-space-between"
                ><span>🛒 Cajero</span><span>Ventas, Caja</span></v-card
              >
              <v-card
                variant="outlined"
                rounded="lg"
                class="pa-4 d-flex justify-space-between"
                ><span>📦 Bodega</span><span>Inventario</span></v-card
              >
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- CTA FINAL -->
      <div id="seguridad" class="py-16" style="background: #111; color: white">
        <v-container class="text-center">
          <v-icon size="48" color="primary">mdi-shield-lock</v-icon>
          <h2 class="text-h4 font-weight-bold mt-4">
            Tus datos seguros, tu negocio tranquilo
          </h2>
          <p class="text-grey-lighten-1 mt-3 mx-auto" style="max-width: 600px">
            Con protección avanzada, cada empresa solo ve sus datos.
            Arquitectura blindada, auditada y probada contra accesos no
            autorizados.
          </p>
          <v-btn
            size="x-large"
            rounded="xl"
            color="primary"
            class="mt-8 px-10"
            to="/sign-in"
            >Iniciar sesión ahora</v-btn
          >
          <!-- <div class="text-caption text-grey mt-4">
            ¿Aún no tienes cuenta? Contáctanos y te la creamos.
          </div> -->
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
defineOptions({
  name: "LandingPageView",
});

const scroll = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
</script>

<style scoped>
.landing {
  background: white;
}
.landing-bar {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid #eee;
}
</style>
