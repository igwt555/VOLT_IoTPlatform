<template>
  <div class="grid">
    <div class="col-12">
      <h5>Configuration</h5>
      <div class="card">
        <div class="col-12 lg:col-4">
          <form @submit.prevent="submitted">
            <div class="field p-fluid">
              <label for="companyName">Company Name</label>
              <InputText id="companyName" v-model="name" name="name" />
            </div>
            <Button
              label="Update"
              class="mr-2 e2e-update-companyname"
              type="submit"
            />
          </form>
        </div>
      </div>
      <div v-if="!isKwikIqProd && !isOtto" class="card">
        <h6>KwikIQ Settings</h6>
        <div class="mb-1">
          <label>
            <input v-model="publishData.kwikiqRequireAdminOccupancyReset" type="checkbox"
            >
            Require Admins to Reset the Occupancy
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqSupportSwapDevice"
              type="checkbox"
            >
            Allow Swap of a Loaner for a Damaged Unit
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqSupportDamagedDevice"
              type="checkbox"
            >
            Allow Return of Damaged Devices
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqSupportItHold"
              type="checkbox"
            >
            Enable IT Device Hold
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqSupportAutoIssuePinCode"
              type="checkbox"
            >
            Auto-Issue Pin Codes for new users
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqOneSwap"
              type="checkbox"
            >
            Restrict usage to one device swap allowed per day
          </label>
        </div>
        <div class="mb-1">
          <label>
            <input
              v-model="publishData.kwikiqAllowReturnWithoutRetrieve"
              type="checkbox"
            >
            Allow device returns without initial retrieval
          </label>
        </div>
        <div class="mb-1">
          <label>Required minimum charge duration
            <select
              v-model="publishData.kwikiqMinChargeDuration"
              style="padding: 5px"
            >
              <option value="no_time_check">No Time Check</option>
              <option value="1_hour">1 Hour</option>
              <option value="2_hour">2 Hour</option>
              <option value="3_hour">3 Hour</option>
            </select>
          </label>
        </div>
        <Button
          label="Save"
          class="mr-2 e2e-update-companyname"
          @click="publish"
        />
      </div>
      <div class="card">
        <div class="field p-fluid">
          <FileUploader
            label="Website Icon"
            :current-logo="organizationFavicon"
          />
        </div>
      </div>
      <div class="card">
        <div class="field p-fluid">
          <FileUploader
            label="Website Logo"
            :current-logo="organizationLogo"
          />
        </div>
      </div>
      <!-- <div class="card">
        <div class="field p-fluid">
          <label for="companyLogo">Company Logo</label>
          <FileUpload
            ref="file-uploader"
            name="file"
            :custom-upload="true"
            :multiple="false"
            accept="image/*"
            :max-file-size="1000000"
            @uploader="onUpload"
            @select="selectFile"
          />
        </div>
      </div> -->
      <div v-if="isOtto" class="card">
        <div class="col-12 lg:col-4">
          <form @submit.prevent="updateAlertPhoneNumbers">
            <div class="field p-fluid">
              <label for="alertPhones">Alert Phone Numbers</label>
              <InputText
                id="alertPhones"
                v-model="alertPhoneNumbers"
                name="alertPhoneNumbers"
              />
            </div>
            <Button label="Update" class="mr-2" type="submit" />
          </form>
        </div>
      </div>
      <div v-if="isOtto" class="card">
        <div class="col-12 lg:col-4">
          <form @submit.prevent="clearLadderData">
            <Button
              label="Clear Ladder Data"
              class="mr-2 p-button-danger"
              type="submit"
              icon="pi pi-times"
            />
          </form>
        </div>
      </div>
      <!-- TODO: remove + all deps -->
      <!--<div class="card">
        <div class="grid">
          <div class="col-12 flex justify-content-between">
            <p for="companyName">Directory</p>
            <Button
              label="Create Directory"
              class="mr-2"
              @click="$router.push('/create-directory')"
            />
          </div>
          <div class="col-12">
            <DataTable
              ref="tableRef"
              v-model:filters="filters"
              :value="directory"
              :paginator="true"
              class="p-datatable-gridlines"
              :rows="10"
              data-key="id"
              :row-hover="true"
              filter-display="menu"
              :loading="loading"
              :filters="filters"
              responsive-layout="scroll"
              sort-field="name"
              :sort-order="1"
              @row-click="goToDirectoryPage"
            >
              <template #header>
                <div
                  class="flex justify-content-between flex-column sm:flex-row"
                >
                  <div>
                    <Button
                      type="button"
                      icon="pi pi-filter-slash"
                      label="Clear"
                      class="p-button-outlined mb-2 mr-3"
                      @click="clearFilter()"
                    />
                    <Button
                      type="button"
                      label="Export"
                      class="p-button mb-2"
                      @click="showPopUp($event)"
                    />
                  </div>
                  <span class="p-input-icon-left mb-2">
                    <InputText
                      v-model="filters['global'].value"
                      placeholder="Directory Name Search"
                      style="width: 100%"
                    />
                  </span>
                </div>
              </template>
              <template #empty> No directory found. </template>
              <template #loading> Loading directory data. Please wait. </template>
              <Column field="name" header="Directory Name">
                <template #body="{ data }">
                  {{ data.name }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by name"
                  />
                </template>
              </Column>
              <Column header="Type" field="type">
                <template #body="{ data }">
                  {{ data.type }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by type"
                  />
                </template>
              </Column>
              <Column header="Provider" field="Provider.name">
                <template #body="{ data }">
                  {{ data.Provider?.name }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by provider"
                  />
                </template>
              </Column>
              <Column header="Action" style="max-width: 8rem">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-fw pi-trash"
                    label="Directory"
                    class="p-button-sm mt-1"
                    @click.stop="openDeleteModal(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div> -->

      <h5 id="UserProvisioning">User Provisioning</h5>
      <div class="card">
        <FormWizard
          v-if="provisioningLoaded"
          ref="wizardAD" color="rgba(var(--vs-primary), 1)" :title="null" :hide-buttons="true" :icon="false"
          :subtitle="null" enctype="multipart/form-data">
          <tab-content>
            <div class="grid">
              <div class="col-12 md:col-6 lg:col-3 pr-10" @click="configAD('Azure')">
                <label>
                  <Card class="cursor-pointer inactive">
                    <template #header>
                      <div class="text-center pt-2">
                        <img src="/images/Microsoft_Azure-Logo.png" style="width: 10rem">
                      </div>
                    </template>
                    <template #content>
                      <h6 class="m-0">Microsoft Azure Active Directory</h6>
                    </template>
                    <template #footer>
                      <div>Status:
                        <Badge v-if="scimToken == null" value="INACTIVE" severity="warning" class="mr-2" />
                        <Badge v-else value="ACTIVE" severity="success" class="mr-2" />
                      </div>
                    </template>
                  </Card>
                </label>
              </div>
              <!-- Allow google workspace for specific organizationId -->
              <div
                v-if="organizationId === 'd71b6305-4d13-44e9-a64e-7cdaab51f0a0' ||
                  organizationId === 'b1132090-ad75-4f19-b449-3595ae1620c2' ||
                  organizationId === '88cecf01-0cd0-466d-ac12-bde2bd3e54e8'"
                class="col-12 md:col-6 lg:col-3 pr-10" @click="configAD('Google')">
                <label>
                  <Card class="cursor-pointer inactive">
                    <template #header>
                      <div class="text-center pt-2"><img src="/images/Google-Logo.png" style="width: 10rem"></div>
                    </template>
                    <template #content>
                      <h6 class="m-0">Google Workspace</h6>
                    </template>
                    <template #footer>
                      <div>Status:
                        <Badge v-if="showAuth" value="INACTIVE" severity="warning" class="mr-2" />
                        <Badge v-else value="ACTIVE" severity="success" class="mr-2" />
                      </div>
                    </template>
                  </Card>
                </label>
              </div>
            </div>
          </tab-content>
          <tab-content>
            <div v-if="selectedAD === 'Azure'" class="grid">
              <div class="grid m-0">
                <h6 style="display: flex;">Microsoft Azure Active Directory Integration Configuration</h6>
                <Button
                  v-tooltip.right="{ value: 'Help' }"
                  class="p-button-icon-only p-button-rounded ml-2"
                  type="button" style="height: 1.4rem !important; width: 1.4rem !important;"
                  @click="openScimHelp('microsoft')">
                  <span class="pi pi-question p-button-icon" style="font-size: .5rem" />
                </Button>
              </div>
              <div class="col-12 justify-content-between">
                <p class="line-height-3 bg-blue-100 p-3 text-sm " style="border-radius:10px;">
                  <i
                    class="pi pi-info-circle" /> <b>How to set up SCIM Application?</b>
                  <br><br>
                  <i class="pi pi-check" /> Copy the <b>SCIM Base URL</b> below and paste it into
                  <b>Tenant URL</b> under you Azure Active Directory Admin Credentials settings.<br>
                  <i class="pi pi-check" /> Copy the <b>Bearer Token</b> below and paste it into
                  <b>Secret Token</b> under your Azure Active Directory Admin Credentials settings.<br>
                  <i class="pi pi-check" /> Once done with the above configuration, you will be able to
                  add/update/sync Users.<br>
                </p>
              </div>
              <div class="col-12">
                <div class="mb-2">
                  <label for="scimURL">SCIM Base URL</label>
                  <div class="p-inputgroup">
                    <InputText id="scimURL" v-model="scimURL" type="text" class="form-control" name="scimURL" />
                    <Button
                      class="p-button p-component p-button-icon-only p-button-secondary" type="button"
                      @click="copyValue(scimURL, 'URL Copied!')">
                      <span class="pi pi-copy p-button-icon" />
                    </Button>
                  </div>
                </div>

                <div class="mb-2">
                  <label for="scimToken">Bearer Token</label>
                  <div class="p-inputgroup">
                    <InputText id="scimToken" v-model="scimToken" type="text" class="form-control" name="scimToken" />
                    <Button
                      class="p-button p-component p-button-icon-only p-button-secondary" type="button"
                      @click="copyValue(scimToken, 'Token Copied!')">
                      <span class="pi pi-copy p-button-icon" />
                    </Button>
                  </div>
                </div>
              </div>
              <div class="col-12 mt-3 flex justify-content-between">
                <Button label="Back" @click="goToBack('AD')" />
                <Button class="ml-1" type="button" @click="saveToken">Generate Token</Button>
              </div>
            </div>
            <div v-else-if="selectedAD === 'Google'" class="grid">
              <div class="grid m-0">
                <h6 style="display: flex;">Google Workspace Configuration</h6>
                <Button
                  v-tooltip.right="{ value: 'Help' }"
                  class="p-button-icon-only p-button-rounded ml-2"
                  type="button" style="height: 1.4rem !important; width: 1.4rem !important;"
                  @click="openScimHelp('google')">
                  <span class="pi pi-question p-button-icon" style="font-size: .5rem" />
                </Button>
              </div>
              <div class="col-12">
                <div class="mb-2">
                  <label for="googleEmail">Admin Email</label>
                  <p class="text-xs mb-0">
                    This email should be your admin user in Google Workspace account that has the role 'Super Admin'.
                  </p>
                  <div class="p-inputgroup">
                    <InputText
                      id="googleEmail"
                      v-model="email"
                      :disabled="!showAuth" type="email" class="form-control" name="googleEmail"
                      placeholder="Email" />
                    <Button
                      v-if="showAuth"
                      :disabled="email === ''"
                      type="button" label="Verify Credentials" @click="authWithGoogle" />
                    <Button v-else disabled="true" type="button" label="Verified" />
                  </div>
                </div>

                <div class="mb-2">
                  <label for="googleDomain">Google Workspace Domain</label>
                  <p class="text-xs mb-0">
                    It is required to define the Google Workspace domain or its domain aliases.
                  </p>
                  <div class="p-inputgroup">
                    <InputText
                      v-model="domain" type="text" :disabled="showAuth"
                      class="form-control" name="googleDomain" placeholder="Domain" />
                  </div>
                </div>
              </div>

              <div class="col-12 mt-3 flex justify-content-between">
                <Button label="Back" @click="goToBack('AD')" />
                <Button
                  v-if="!showAuth"
                  :loading="isGoogleUserSync"
                  :disabled="domain === ''" label="Sync Users" class="flex ml-auto"
                  @click="syncWithGoogle" />
                <Button
                  v-if="!showAuth"
                  :loading="isGoogleConfigDelete"
                  label="Delete Configuration" class="flex ml-2 p-button-danger"
                  @click="showDeleteGoogleConfig($event)" />
              </div>
            </div>
          </tab-content>
        </FormWizard>
        <div v-else class="grid">
          <div class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
          <!-- Allow google workspace for specific organizationId -->
          <div
            v-if="organizationId === 'd71b6305-4d13-44e9-a64e-7cdaab51f0a0' ||
              organizationId === 'b1132090-ad75-4f19-b449-3595ae1620c2' ||
              organizationId === '88cecf01-0cd0-466d-ac12-bde2bd3e54e8'"
            class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SAML Providers UI -->
      <h5>Single Sign On (SSO)</h5>
      <div class="card">
        <FormWizard
          v-if="provisioningLoaded"
          ref="wizardSSO" color="rgba(var(--vs-primary), 1)" :title="null" :hide-buttons="true" :icon="false"
          :subtitle="null" enctype="multipart/form-data">
          <tab-content>
            <div class="grid">
              <div class="col-12 justify-content-between pb-3">
                <h6>Select identity provider (idP)</h6>
                <p>We supports the following IdPs for setting up authentication via SAML 2.0</p>
              </div>
              <div
                v-for="(provider, index) in samlProvider"
                :key="index" class="col-12 md:col-6 lg:col-3 pr-10">
                <label>
                  <Card :loading="true" class="cursor-pointer inactive" @click="changeTabSSO(provider.type)">
                    <template #header>
                      <div class="text-center pt-2"><img :src="provider.logo_filename" style="width: 10rem"></div>
                    </template>
                    <template #content>
                      <h6 class="m-0">{{ provider.name }}</h6>
                    </template>
                    <template #footer>
                      <div>Status:
                        <Badge
                          v-if="(provider.cert === '' || provider.cert == null) ||
                            (provider.entry_point === '' || provider.entry_point == null)"
                          value="INACTIVE" severity="warning" class="mr-2" />
                        <Badge v-else value="ACTIVE" severity="success" class="mr-2" />
                      </div>
                    </template>
                  </Card>
                </label>
              </div>
            </div>
          </tab-content>
          <tab-content>
            <div class="grid">
              <div class="col-12 justify-content-between">
                <!-- {{ samlName }} -->
                <div class="grid">
                  <h6 style="display: flex;">Configure for {{ isSSOLoaded ? samlName : "" }} set up</h6>
                  <div v-if="selectedSAMLProvider === 'microsoft' || selectedSAMLProvider === 'google'">
                    <Button
                      v-tooltip.right="{ value: 'Help' }"
                      class="p-button-icon-only p-button-rounded ml-2"
                      type="button" style="height: 1.2rem !important; width: 1.2rem !important;"
                      @click="openHelp(selectedSAMLProvider)">
                      <span class="pi pi-question p-button-icon" style="font-size: .5rem" />
                    </Button>
                  </div>
                </div>
                <p>
                  To set up Volt-IoT app on {{ isSSOLoaded ? samlName : "" }}, you will need the following
                  details to completed the integration.
                </p>
              </div>
              <div class="col-12 justify-content-between">
                <label for="samlIdentifier"><b>Entity ID</b></label>
                <p class="text-xs mb-0">
                  This URL will be used by {{ isSSOLoaded ? samlName : "" }}
                  to identify our requests.
                </p>
                <div class="p-inputgroup">
                  <InputText id="samlIdentifier" v-model="samlIdentifier" disabled type="text" class="form-control" />
                  <Button
                    class="p-button p-component p-button-icon-only p-button-secondary" type="button"
                    @click="copyValue(samlIdentifier, 'URL Copied!')">
                    <span class="pi pi-copy p-button-icon" /><span class="p-button-label">&nbsp;</span>
                    <span class="p-ink" style="height: 42px;width: 42px;top: -9.25px;left: 3.03125px" />
                  </Button>
                </div>
              </div>
              <div class="col-12 justify-content-between">
                <label for="samlReplyURL"><b>Reply URL (Assertion Consumer Service URL)</b></label>
                <p class="text-xs mb-0">
                  The {{ isSSOLoaded ? samlName : "" }} application will need this ACS URL for service provider
                  initiated flows. Copy & use the URL
                </p>
                <div class="p-inputgroup">
                  <InputText id="samlReplyURL" v-model="samlReplyURL" disabled type="text" class="form-control" />
                  <Button
                    class="p-button p-component p-button-icon-only p-button-secondary" type="button"
                    @click="copyValue(samlReplyURL, 'URL Copied!')">
                    <span class="pi pi-copy p-button-icon" /><span class="p-button-label">&nbsp;</span>
                    <span class="p-ink" style="height: 42px;width: 42px;top: -9.25px;left: 3.03125px" />
                  </Button>
                </div>
              </div>
              <div class="col-12 justify-content-between">
                <br>
                <p>You will get the below details from {{ isSSOLoaded ? samlName : "" }} SSO Provider</p>
              </div>
              <div class="col-12 justify-content-between">
                <label for="idpLoginURL"><b>Idp Login URL</b></label>
                <p class="text-xs mb-0">
                  Paste the Login URL provided by {{ isSSOLoaded ? samlName : "" }}
                  when completing the setup of your app. You may also find this in the metadata file
                </p>
                <InputText
                  v-if="isSSOLoaded" id="idpLoginURL"
                  v-model.trim="idpLoginURL" class="w-100 mb-2" name="idpLoginURL" />
                <div v-else class="custom-skeleton">
                  <div class="p-skeleton p-component" style="width:100%;height:39px;" />
                </div>
              </div>
              <div class="col-12 justify-content-between">
                <label for="samlCert"><b>Public Certificate</b></label>
                <p class="text-xs mb-0">
                  Paste the public certificate you are presented with when completing
                  the setup of your app in {{ isSSOLoaded ? samlName : "" }}
                </p>
                <Textarea
                  v-if="isSSOLoaded"
                  id="samlCert" v-model.trim="samlCert" class="w-100" name="samlCert" :auto-resize="true"
                  rows="10" cols="30" />
                <div v-else class="custom-skeleton">
                  <div class="p-skeleton p-component" style="width:100%;height:228px;" />
                </div>
              </div>
              <div class="col-12 mt-3 flex justify-content-between">
                <Button label="Back" @click="goToBack('SSO')" />
                <Button
                  :loading="isSaveSSO"
                  :disabled="!samlCert || !idpLoginURL" label="Save Configuration" class="flex ml-auto"
                  @click="updateSAML" />
                <Button
                  v-if="samlId !== null"
                  :loading="isDeleteSSO"
                  label="Delete Configuration" class="flex ml-2 p-button-danger"
                  @click="deleteSAML" />
              </div>
            </div>
          </tab-content>
        </FormWizard>
        <div v-else class="grid">
          <div class="col-12 justify-content-between pb-3">
            <h6>Select identity provider (idP)</h6>
            <p>We supports the following IdPs for setting up authentication via SAML 2.0</p>
          </div>
          <div class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3 pr-10">
            <div class="p-card">
              <div class="custom-skeleton p-4">
                <div class="p-skeleton p-component" style="width:100%;height:54px;" />
                <div class="flex mb-3 mt-4">
                  <div class="p-skeleton p-component mb-2" style="width:10rem;height: 2rem;" />
                </div>
                <div class="flex mt-3">
                  <div class="p-skeleton p-component" style="width:4rem;height:1rem;" />
                  <div class="p-skeleton p-component ml-2" style="width:4rem;height: 1rem;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- pop-up -->
    <ConfirmPopup group="buttonPopup" />
    <ConfirmPopup group="demo">
      <template #message="slotProps">
        <div class="p-d-flex p-p-4">
          <i :class="slotProps.message.icon" style="font-size: 1.5rem" />
          <p ref="div" class="p-pl-2">
            {{ slotProps.message.message }}
          </p>
        </div>
      </template>
    </ConfirmPopup>

    <!-- Delete Directory pop-up -->
    <Dialog
      v-model:visible="deleteConfirmation"
      header="Confirmation"
      :style="{ width: '350px' }"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span
        >Are you sure you want to delete
          <b>{{ deleteDirectoryDetails?.name }}</b> directory?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeModal"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          autofocus
          @click="deleteDir"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
// import ConfigurationService from '@/service/ConfigurationService';
import {
  defineComponent,
  computed,
  ref,
  onMounted, reactive, toRefs,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import { FormWizard, TabContent } from 'vue3-form-wizard';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, email } from '@vuelidate/validators';
import defaultCompanyFavicon from '../assets/images/favicon.svg';
import defaultCompanyLogo from '../assets/images/default_company_logo.png';
import FileUploader from '../components/utils/FileUploader.vue';
import { useToastService } from '../composables/useToast.mjs';
import 'vue3-form-wizard/dist/style.css';

export default defineComponent({
  components: {
    FormWizard,
    TabContent,
    FileUploader,
  },
  setup() {
    const initFilter = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      type: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      'Provider.name': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
    const { dispatch, getters } = useStore();
    const tableRef = ref(null);
    const directory = computed(() => getters.directorys);
    const samlProvider = computed(() => getters.samlProviders);
    const samlDetail = computed(() => getters.samlDetails);
    const filters = ref(initFilter());
    const { push, currentRoute } = useRouter();
    const selectedSupportMinimumChargeDuration = ref('');
    const organizationName = computed(() => getters.organizationName);
    const azureADSecret = computed(() => getters.azure_ad_secret);
    const organizationId = computed(() => JSON.parse(localStorage.getItem('vuex'))?.auth?.user?.organization_id);
    const organizationLogo = computed(() => getters.organization?.logo_filename ?? defaultCompanyLogo);
    const organizationFavicon = computed(() => getters.organization?.favicon_filename ?? defaultCompanyFavicon);
    const alertNumber = computed(() => getters.alertPhoneNumber);
    const userEmailAddress = computed(() => getters.user?.email);
    const alertPhoneNumbers = ref(null);
    const name = ref(null);
    const loading = ref(false);
    const err = computed(() => getters.getError);
    const { showToast } = useToastService();
    const confirm = useConfirm();
    const selectedKey1 = ref(null);
    const scimURL = ref(null);
    const scimToken = ref(null);
    const provisioningLoaded = ref(false);
    const isGoogleUserSync = ref(false);
    const isGoogleConfigDelete = ref(false);
    const isSaveSSO = ref(false);
    const isDeleteSSO = ref(false);
    const isSSOLoaded = ref(true);
    const wizardSSO = ref(null);
    const wizardAD = ref(null);
    const selectedSAMLProvider = ref(null);
    const samlId = ref(null);
    const samlIdentifier = ref(null);
    const samlReplyURL = ref(null);
    const idpLoginURL = ref(null);
    const samlCert = ref(null);
    const samlName = ref(null);
    const showStopWebhook = ref(false);
    const showAuth = ref(false);
    const selectedAD = ref('');
    // const Email = ref(null);
    const organization = computed(() => getters.organization);

    // validation rules
    const rules = computed(() => ({
      email: {
        required: helpers.withMessage('Email is required', required),
        email: helpers.withMessage('Invalid email', email),
      },
      domain: {
        required: helpers.withMessage('Domain is required', required),
      },
    }));
    const state = reactive({
      email: '',
      domain: '',
    });
    const v$ = useVuelidate(rules, state);
    const organizationData = computed(() => getters.organization);
    const publishData = reactive({
      kwikiqRequireAdminOccupancyReset: false,
      kwikiqOneSwap: false,
      kwikiqSupportDamagedDevice: false,
      kwikiqSupportItHold: false,
      kwikiqSupportAutoIssuePinCode: false,
      kwikiqMinChargeDuration: 'no_time_check',
      kwikiqSupportSwapDevice: false,
      kwikiqAllowReturnWithoutRetrieve: false,
    });
    watch(organizationData, newValue => {
      if (newValue !== undefined) {
        publishData.kwikiqRequireAdminOccupancyReset =
          organizationData.value?.settings?.kwikiqRequireAdminOccupancyReset;
        publishData.kwikiqOneSwap =
          organizationData.value?.settings?.kwikiqOneSwap;
        publishData.kwikiqSupportDamagedDevice =
          organizationData.value?.settings?.kwikiqSupportDamagedDevice;
        publishData.kwikiqSupportItHold =
          organizationData.value?.settings?.kwikiqSupportItHold;
        publishData.kwikiqSupportAutoIssuePinCode =
          organizationData.value?.settings?.kwikiqSupportAutoIssuePinCode;
        publishData.kwikiqMinChargeDuration =
          organizationData.value?.settings?.kwikiqMinChargeDuration;
        publishData.kwikiqSupportSwapDevice =
          organizationData.value?.settings?.kwikiqSupportSwapDevice;
        publishData.kwikiqAllowReturnWithoutRetrieve =
          organizationData.value?.settings?.kwikiqAllowReturnWithoutRetrieve;
      }
    });
    // const uploaderRef = ref('file-uploader');
    const organizationDetail = computed(() => getters.organizationDetail);
    const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));
    const isKwikIqProd = computed(() => window.location.host.split('.')[0] === 'kwikiq');
    const publish = async () => {
      await dispatch('publish', publishData);
    };

    const scrollToLocation = (selector, yOffset = 0) => {
      const el = document.querySelector(selector);
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const configAD = async val => {
      if (val === 'Azure') {
        selectedAD.value = 'Azure';
      } else {
        selectedAD.value = 'Google';
      }

      wizardAD.value.nextTab();
    };

    onMounted(async () => {
      await dispatch('getOrganization', organizationId.value);
      await dispatch('getChildOrgs', { id: organizationId.value });
      alertPhoneNumbers.value = alertNumber.value ? alertNumber.value : '';
      name.value = organizationName.value ? organizationName.value : '';
      scimURL.value =
        process.env.NODE_ENV === 'production'
          ? `https://${window.location.hostname}/api/scim/`
          : `${import.meta.env.VITE_APP_BASE_URL}/api/scim/`;
      scimToken.value = azureADSecret.value;
      await dispatch('getAllDirectorys');
      await dispatch('getSAMLProviders');

      if (organization.value.google_workspace_token?.WebhookDetail !== undefined &&
      Object.keys(organization.value.google_workspace_token?.WebhookDetail).length > 0) {
        showStopWebhook.value = true;
      }

      if (organization.value.google_workspace_token !== null) {
        const { token } = organization.value.google_workspace_token;
        state.email = token.email;
        state.domain = token.domain;

        showAuth.value = false;
      } else {
        state.email = userEmailAddress.value;
        showAuth.value = true;
      }

      provisioningLoaded.value = true;

      if (currentRoute.value.query.config) {
        setTimeout(() => {
          configAD('Google');
          scrollToLocation('#UserProvisioning', -120);
        }, 200);
      }
    });

    const clearFilter = () => {
      filters.value = initFilter();
    };

    const exportCSV = () => {
      tableRef.value.exportCSV();
    };

    const goToDirectoryPage = data => {
      push(`/create-directory/${data.data.id}`);
    };

    const showPopUp = event => {
      confirm.require({
        target: event.currentTarget,
        message: 'Export directory list to CSV',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Download',
        accept: () => exportCSV(),
      });
    };

    const deleteDirectoryDetails = ref(null);
    const deleteConfirmation = ref(false);
    const openDeleteModal = data => {
      deleteDirectoryDetails.value = data;
      deleteConfirmation.value = true;
    };

    const closeModal = () => {
      deleteConfirmation.value = false;
    };

    const deleteDir = async () => {
      await dispatch('deleteDirectory', {
        dirId: deleteDirectoryDetails.value.id,
      });
      const error = getters.deleteDirError;
      const successMsg = getters.deleteDirMsg;
      if (error) {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: error,
        });
      } else {
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: successMsg,
        });
      }
      await dispatch('getAllDirectorys');
      closeModal();
    };

    const updateAlertPhoneNumbers = async () => {
      try {
        await dispatch('updateAlertPhoneNumber', {
          phoneNumbers: alertPhoneNumbers.value,
          id: organizationId.value,
        });
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Phone numbers list for alerting was updated successfully',
        });
      } catch (error) {
        console.log(error);
        showToast({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured when updating alert phone number. Please contact support.',
        });
      }
    };

    const clearLadderData = async () => {
      try {
        await dispatch('deleteEvents');
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Ladder data successfully cleared',
        });
      } catch (error) {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured while clearing out ladder data. Please contact support.',
        });
      }
    };

    const submitted = async () => {
      try {
        await dispatch('updateCompany', {
          name: name.value,
          id: organizationId.value,
        });
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Company name updated',
        });
      } catch (error) {
        console.log(error);
        showToast({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured when saving your company name. Please contact support.',
        });
      }
    };

    const selectFile = async event => {
      if (event.files.length > 1) {
        event.files.splice(0, 1);
      }
    };

    const onUpload = async event => {
      try {
        const file = event.files[0];
        const data = new FormData();
        data.append('file', file);
        data.append('id', organizationId.value);
        loading.value = true;
        await dispatch('updateCompanyLogo', data);
        if (err.value) {
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: err.value,
          });
        } else {
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Company logo updated',
            life: 3000,
          });
        }
      } catch (error) {
        console.log(error);
        showToast({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured when uploading your company logo. Please contact support.',
        });
      }
    };

    const saveToken = async () => {
      try {
        await dispatch('updateAzureAdSecret', {
          id: organizationId.value,
        }).then(res => {
          scimToken.value = res.azure_ad_secret;
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Token Generated Successfully',
            life: 3000,
          });
        });
      } catch (error) {
        console.log(error);
        showToast({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured when saving your company name. Please contact support.',
        });
      }
    };

    function copyToClipboard(text) {
      if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        // return clipboardData.setData("Text", text);
      } else if (
        document.queryCommandSupported &&
        document.queryCommandSupported('copy')
      ) {
        const textarea = document.createElement('textarea');
        textarea.textContent = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
          return document.execCommand('copy'); // Security exception may be thrown by some browsers.
        } catch (ex) {
          console.warn('Copy to clipboard failed.', ex);
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
      return 0;
    }

    const copyValue = (Name, Message) => {
      copyToClipboard(Name);
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: Message,
        life: 3000,
      });
    };

    const changeTabSSO = async provider => {
      isSSOLoaded.value = false;
      selectedSAMLProvider.value = provider;
      samlIdentifier.value = process.env.NODE_ENV === 'production'
        ? `https://${window.location.hostname}/${organizationId.value}`
        : `${import.meta.env.VITE_APP_BASE_URL}/${organizationId.value}`;

      samlReplyURL.value =
        process.env.NODE_ENV === 'production'
          ? `https://${window.location.hostname}/api/saml/consume`
          : `${import.meta.env.VITE_APP_BASE_URL}/api/saml/consume`;

      samlId.value = getters.samlProviders.filter(
        x => x.type === selectedSAMLProvider.value,
      )[0].id;

      wizardSSO.value.nextTab();
      if (samlId.value !== null) {
        await dispatch('getSAMLProvider', samlId.value);
        isSSOLoaded.value = true;
        if (
          samlDetail.value.entry_point !== '' &&
          samlDetail.value.entry_point != null
        ) {
          idpLoginURL.value = samlDetail.value.entry_point;
        }
        if (samlDetail.value.cert !== '' && samlDetail.value.cert != null) {
          samlCert.value = samlDetail.value.cert;
        }

        samlName.value = samlDetail.value.name;
      } else {
        isSSOLoaded.value = true;
        const detailObj = getters.samlProviders.filter(
          x => x.type === selectedSAMLProvider.value,
        )[0];
        samlName.value = detailObj.name;
        idpLoginURL.value = '';
        samlCert.value = '';
      }
    };

    const changeTabAD = async () => {
      wizardAD.value.nextTab();
    };

    const goToBack = type => {
      if (type === 'SSO') {
        wizardSSO.value.prevTab();
      } else {
        wizardAD.value.prevTab();
      }
    };

    const updateSAML = async () => {
      isSaveSSO.value = true;
      let id = null;
      if (samlId.value !== null) {
        id = samlId.value;
      }

      let logoPath = '/images/Microsoft_Azure-Logo.png';
      if (selectedSAMLProvider.value === 'google') {
        logoPath = '/images/Google-Logo.png';
      } else if (selectedSAMLProvider.value === 'okta') {
        logoPath = '/images/Okta-Logo.png';
      } else if (selectedSAMLProvider.value === 'saml') {
        logoPath = '/images/saml-logo.png';
      }

      const body = {
        name: samlName.value,
        type: selectedSAMLProvider.value,
        logo_filename: logoPath,
        entry_point: idpLoginURL.value,
        cert: samlCert.value
          .replaceAll('\n', '')
          .replace('-----BEGIN CERTIFICATE-----', '')
          .replace('-----END CERTIFICATE-----', ''),
      };

      await dispatch('updateSAMLProvider', { id, body });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'SAML configuration has been saved successfully',
        life: 3000,
      });

      isSaveSSO.value = false;
      selectedSAMLProvider.value = '';
      samlIdentifier.value = '';
      samlReplyURL.value = '';
      idpLoginURL.value = '';
      samlCert.value = '';
      samlName.value = '';
      wizardSSO.value.prevTab();
    };

    const deleteSAML = async () => {
      isDeleteSSO.value = true;
      let id = null;
      if (samlId.value !== null) {
        id = samlId.value;
      }

      await dispatch('deleteSAMLProvider', id);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'SAML configuration has been deleted successfully',
        life: 3000,
      });

      isDeleteSSO.value = false;
      selectedSAMLProvider.value = '';
      samlIdentifier.value = '';
      samlReplyURL.value = '';
      idpLoginURL.value = '';
      samlCert.value = '';
      samlName.value = '';
      wizardSSO.value.prevTab();
    };

    const openHelp = async provider => {
      if (provider === 'microsoft' || provider === 'google') {
        const fileUrl = (provider === 'microsoft' ? '/help/Azure SSO Guide.pdf' : '/help/Google SSO Guide.pdf');
        fetch(fileUrl)
          .then(resp => resp.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'SSO Guide.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(ex => console.log(ex));
      }
    };

    const openScimHelp = provider => {
      const fileUrl = (provider === 'microsoft' ? '/help/Azure User Provisioning Guide.pdf' : '/help/Google User Provisioning Guide.pdf');
      fetch(fileUrl)
        .then(resp => resp.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'User Provisioning Guide.pdf';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch(ex => console.log(ex));
    };

    const authWithGoogle = async () => {
      state.domain = state.email.split('@').pop();
      v$.value.$validate();
      if (!v$.value.$error) {
        const res = await dispatch('authGoogle', { Email: state.email, Domain: state.domain });
        if (res.isAuthorized === false && res.authorizeUrl !== '') {
          window.location = res.authorizeUrl; // , '_blank');
        }
      }
    };

    const syncWithGoogle = async () => {
      isGoogleUserSync.value = true;
      const response = await dispatch('googleUsers', { Domain: state.domain });
      await dispatch('getOrganization', organizationId.value);

      if (organization.value.google_workspace_token?.WebhookDetail !== undefined &&
      Object.keys(organization.value.google_workspace_token?.WebhookDetail).length > 0) {
        showStopWebhook.value = true;
      }

      if (organization.value.google_workspace_token !== null) {
        const { token } = organization.value.google_workspace_token;
        state.email = token.email;
        state.domain = token.domain;

        showAuth.value = false;
      } else {
        state.email = userEmailAddress.value;
        state.domain = '';
        showAuth.value = true;
      }

      isGoogleUserSync.value = false;
      if (response.success === false) {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.message,
          life: 3000,
        });
      } else {
        showToast({
          severity: 'success',
          detail: 'Users synced successfully.',
          life: 3000,
        });
      }
    };

    const stopWebhook = async () => {
      isGoogleConfigDelete.value = true;
      const result = await dispatch('stopWebhook');
      await dispatch('getOrganization', organizationId.value);

      if (organization.value.google_workspace_token?.WebhookDetail !== undefined &&
      Object.keys(organization.value.google_workspace_token?.WebhookDetail).length > 0) {
        showStopWebhook.value = true;
      }

      if (organization.value.google_workspace_token !== null) {
        const { token } = organization.value.google_workspace_token;
        state.email = token.email;
        state.domain = token.domain;

        showAuth.value = false;
      } else {
        state.email = userEmailAddress.value;
        state.domain = '';
        showAuth.value = true;
      }

      isGoogleConfigDelete.value = false;
      if (result.success) {
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Configuration has been deleted successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: result.message,
          life: 3000,
        });
      }
    };

    const showDeleteGoogleConfig = event => {
      confirm.require({
        group: 'buttonPopup',
        target: event.currentTarget,
        message: 'Are you sure you want to delete this configuration?',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => stopWebhook(),
      });
    };

    return {
      initFilter,
      tableRef,
      directory,
      samlProvider,
      filters,
      organizationName,
      azureADSecret,
      organizationId,
      alertNumber,
      alertPhoneNumbers,
      name,
      loading,
      err,
      selectedKey1,
      scimURL,
      scimToken,
      provisioningLoaded,
      isGoogleUserSync,
      isGoogleConfigDelete,
      isSaveSSO,
      isDeleteSSO,
      isSSOLoaded,
      wizardSSO,
      wizardAD,
      selectedSAMLProvider,
      samlId,
      organizationDetail,
      organizationLogo,
      organizationFavicon,
      samlIdentifier,
      samlReplyURL,
      idpLoginURL,
      samlCert,
      samlName,
      clearFilter,
      exportCSV,
      goToDirectoryPage,
      showPopUp,
      showDeleteGoogleConfig,
      deleteDirectoryDetails,
      deleteConfirmation,
      openDeleteModal,
      closeModal,
      deleteDir,
      updateAlertPhoneNumbers,
      clearLadderData,
      submitted,
      selectFile,
      onUpload,
      saveToken,
      copyValue,
      copyToClipboard,
      changeTabSSO,
      changeTabAD,
      goToBack,
      updateSAML,
      deleteSAML,
      openHelp,
      openScimHelp,
      isOtto,
      syncWithGoogle,
      authWithGoogle,
      organization,
      stopWebhook,
      v$,
      ...toRefs(state),
      showStopWebhook,
      showAuth,
      configAD,
      selectedAD,
      isKwikIqProd,
      selectedSupportMinimumChargeDuration,
      publish,
      publishData,
      organizationData,
      userEmailAddress,
      scrollToLocation,
    };
  },
});
</script>

<style lang="scss">
button.p-button.p-component.p-button-icon-only {
  width: 2.357rem !important;
}

.active {
  border: 1px solid #2680eb !important;
}
.inactive {
  border: 1px solid #e9ecef;
}

.wizard-progress-with-circle {
  display: none !important;
}

.p-card-content {
  padding-top: 0px !important;
  height: 40px;
}
.p-card-body {
  padding-top: 0.5rem !important;
}

.wizard-nav.wizard-nav-pills {
  display: none !important;
}
.vue-form-wizard .wizard-tab-content,
.vue-form-wizard  {
     padding: 0px !important;
}
</style>
