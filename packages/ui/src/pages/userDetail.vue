<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div
          class="
            col-12
            flex
            align-items-center
            justify-content-between
            flex-wrap
          "
          style="width: auto"
        >
          <div class="col-12 md:col-4 xl:col-5">
            <div class="flex align-items-center flex-wrap">
              <Avatar
                icon="pi pi-user"
                size="xlarge"
                class="mr-2 col-4"
                shape="circle"
              />
              <span class="userName">{{ user?.full_name }}</span>
            </div>
          </div>
          <div class="col-12 md:col-8 xl:col-7 ">
            <div
              class="
              flex
              align-items-center
              flex-wrap
              justify-content-evenly
            "
            >
              <div
                class="col-6 md:col-6 lg:col-6 xl:col-3
                flex justify-content-start md:justify-content-strat
                lg:justify-content-start xl:justify-content-end"
              >
                <Button
                  v-if="isKwikiq"
                  label="Add Access Method"
                  class="p-button-sm e2e-addaccess-method"
                  @click="openAccessMethodPopUp"
                />
              </div>
              <div
                class="col-6 md:col-6 lg:col-6 xl:col-3
                flex justify-content-start md:justify-content-start
                lg:justify-content-start xl:justify-content-center"
              >
                <Button
                  v-if="isKwikiq"
                  label="Assign Bay"
                  class="p-button-sm"
                  @click="openBaysPopUp"
                />
              </div>
              <div class="col-6 md:col-6 lg:col-6 xl:col-3">
                <Button
                  label="Reset Password"
                  class="p-button-sm"
                  :loading="mailSending"
                  @click="resetPassword"
                />
              </div>
              <div class="col-6 md:col-6 lg:col-6 xl:col-3">
                <Button
                  label="Change Password"
                  class="p-button-sm e2e-changepassword"
                  @click="openPopUp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="col-12 lg:col-4">
          <div class="flex justify-content-between">
            <p class="emailHolder">
              Email: {{ user?.email }}
            </p>
            <i
              class="pi pi-pencil"
              style="cursor: pointer;"
              @click="openEditUser"
            />
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <div class="flex justify-content-between">
            <p class="emailHolder">
              Role:
              {{ user?.Role?.name || "N/A" }}
            </p>
            <i
              class="pi pi-pencil"
              style="cursor: pointer;"
              @click="openRole"
            />
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <div class="flex justify-content-between">
            <p class="emailHolder">
              Phone Number: {{ user?.phoneNo }}
            </p>
            <i
              class="pi pi-pencil"
              style="cursor: pointer;"
              @click="openEditPhoneNo"
            />
          </div>
        </div>

        <div class="col-12 lg:col-4 mb-5">
          <div class="flex justify-content-between">
            <p class="emailHolder">Status: {{ isActive? 'Active' : 'Suspended' }}</p>
            <div class="flex justify-content-end">
              <InputSwitch
                v-model="isActive"
                @change="updateIsActive"
              />
            </div>
          </div>
        </div>

        <!-- data table -->
        <DataTable
          v-if="isKwikiq"
          v-model:filters="reportFilters"
          class="p-datatable-gridlines mb-6"
          data-key="id"
          responsive-layout="scroll"
          show-gridlines
          filter-display="menu"
          :filters="filters"
          :value="reportArr"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="reportArr ? (reportArr.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'status']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <div>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined"
                  @click="clearReportFilter()"
                />
              </div>
              <h5
                class="m-0"
                style="line-height: 34px"
              >
                User Activity Log
              </h5>
            </div>
          </template>
          <template #empty>
            No reports found.
          </template>
          <template #loading>
            Loading reporting data. Please wait.
          </template>
          <Column
            sortable
            field="event"
            header="Status"
            style="min-width: 11rem"
          >
            <template #body="{ data }">
              <span :class="`reports-badge status-${data.event}`">{{ data.event.replaceAll('_', ' ') }}</span>
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.value"
                :options="statuses"
                placeholder="Search by status"
                class="p-column-filter"
                :show-clear="true"
              >
                <template #value="slotProps">
                  <span
                    v-if="slotProps.value"
                    :class="'reports-badge status-' + slotProps.value"
                  >{{ slotProps.value }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'reports-badge status-' + slotProps.option">{{ slotProps.option }}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column
            sortable
            field="Device.serial_num"
            header="Unit Id"
            style="min-width: 8rem"
          >
            <template #body="{ data }">
              {{ data.Device && data.Device.serial_num }}
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.value"
                :options="serialNum"
                placeholder="Search by Unit Id"
                class="p-column-filter"
                :show-clear="true"
              >
                <template #value="slotProps">
                  <span
                    v-if="slotProps.value"
                    :class="'reports-badge status-' + slotProps.value"
                  >{{ slotProps.value }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'reports-badge status-' + slotProps.option">{{ slotProps.option }}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column
            sortable
            field="KbDevice.make"
            header="Device Manufacturer"
            style="min-width: 8rem"
          >
            <template #body="{ data }">
              {{ data.KbDevice && data.KbDevice.make }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Device Manufacturer"
              />
            </template>
          </Column>
          <Column
            sortable
            field="location.name"
            header="Location"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data.location && data.location.name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Location"
              />
            </template>
          </Column>
          <Column
            sortable
            field="chamber_id"
            header="Chamber #"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <span>{{ data.chamber_id }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Chamber"
              />
            </template>
          </Column>
          <Column
            sortable
            filter-field="date"
            header="Date & Time"
            style="min-width: 12rem"
            data-type="date"
            field="date"
          >
            <template #body="{ data }">
              {{ formatDateTime(data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="Search by Date"
                :show-time="true"
                hour-format="12"
              />
            </template>
          </Column>
          <Column
            sortable
            field="report"
            header="Report"
            style="min-width: 15rem"
          >
            <template #body="{ data }">
              <span>
                {{ `Access Granted on chamber ${data.chamber_id} on Locker ${data.Device && data.Device.serial_num}` }}
              </span>
            </template>
          </Column>
        </DataTable>

        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines mb-6"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="userNotifications"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="userNotifications ? (userNotifications.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'status']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <div>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined mb-2 mr-3"
                  @click="clearFilter()"
                />
              </div>
              <h5
                class="m-0"
                style="line-height: 34px"
              >
                Email Notifications
              </h5>
            </div>
          </template>
          <template #empty>
            No email notification found.
          </template>
          <template #loading>
            Loading email notification data. Please wait.
          </template>
          <Column
            sortable
            field="subject"
            header="Message"
            style="min-width: 10rem"
            class="e2e-message-filter"
          >
            <template #body="{ data }">
              {{ data.subject }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Message"
              />
            </template>
          </Column>
          <Column
            sortable
            field="created_at"
            header="Sent On"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
            class="e2e-senton-filter"
          >
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="mm/dd/yyyy"
              />
            </template>
          </Column>
          <Column
            header="Status"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <span
                v-if="data.sent === 1"
                class="reports-badge"
              >Sent</span>
              <span
                v-if="data.received === 1"
                class="reports-badge"
              >Received</span>
              <span
                v-if="data.opened === 1"
                class="reports-badge"
              >Opened</span>
              <span
                v-if="data.undelivered === 1"
                class="reports-badge"
              >Undelivered</span>
            </template>
          </Column>
          <Column
            sortable
            field="recipient"
            header="Recipient"
            style="min-width: 10rem"
            class="e2e-recipient-filter"
          >
            <template #body="{ data }">
              {{ data.recipient }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Recipient"
              />
            </template>
          </Column>
          <Column
            header="Email Body"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <Button
                type="button"
                icon="pi pi-eye"
                class="p-button-outlined mb-2 mr-3"
                @click="viewEmailBody(data)"
              />
            </template>
          </Column>
        </DataTable>

        <DataTable
          v-if="isKwikiq"
          ref="tableRef"
          v-model:filters="filters2"
          class="p-datatable-gridlines mb-6"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="userAccessMethod"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="userAccessMethod ? (userAccessMethod.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'type', 'data']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <div>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined"
                  @click="clearAccessMethodFilter()"
                />
              </div>
              <h5
                class="m-0"
                style="line-height: 34px"
              >
                Currently Assigned Access Methods
              </h5>
            </div>
          </template>
          <template #empty>
            No access methods found.
          </template>
          <template #loading>
            Loading access method data. Please wait.
          </template>
          <Column
            sortable
            field="type"
            header="Type"
            style="min-width: 10rem"
            class="e2e-type"
          >
            <template #body="{ data }">
              <span v-if="data.type === 'pin_code'">Pin Code</span>
              <span v-if="data.type === 'rfid_tag'">RFID Tag</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Type"
              />
            </template>
          </Column>
          <Column
            sortable
            field="data"
            header="Data"
            style="min-width: 10rem"
            class="e2e-data"
          >
            <template #body="{ data }">
              <span v-if="data.type === 'pin_code'">{{ stringReplace(data.data) }}</span>
              <span v-if="data.type === 'rfid_tag'">{{ stringReplace(data.data) }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Data"
              />
            </template>
          </Column>
          <Column
            sortable
            field="statusColTemplate"
            header="Status"
            style="min-width: 10rem"
            class="e2e-status"
          >
            <template #body="{ data }">
              <span>{{ data.statusColTemplate }}</span>
            </template>
          </Column>
          <Column
            sortable
            field="created_at"
            header="Date"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
            class="e2e-date"
          >
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="mm/dd/yyyy"
              />
            </template>
          </Column>
          <Column
            header="Action"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <Button
                v-if="isActiveAccessMethod(data)"
                type="button"
                label="Unassign"
                class="p-button-outlined mb-2 mr-3"
                @click="unassignUser(data)"
              />
            </template>
          </Column>
        </DataTable>

        <DataTable
          v-if="isKwikiq"
          ref="tableRef"
          v-model:filters="reservationfilters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="userReservations"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="userReservations ? (userReservations.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id','created_at']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <div>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined"
                  @click="clearReservationFilter()"
                />
              </div>
              <h5
                class="m-0"
                style="line-height: 34px"
              >
                Device / Chamber Reservations
              </h5>
            </div>
          </template>
          <template #empty>
            No reservations found.
          </template>
          <template #loading>
            Loading reservations data. Please wait.
          </template>
          <Column
            field="reservation"
            header="Reservation"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <span v-if="data?.chamber_id">Chamber {{ data.chamber_id + 1 }}
                <span v-if="data.Device">on&nbsp;
                  <a :href="'/units/' + data?.Device?.id">
                    {{ `Unit ${data.Device.serial_num}` }}
                  </a>
                </span>
              </span>
              <span v-else>
                Device: {{ data.KbDevice?.make }} {{ data.KbDevice?.model }} {{ data.KbDevice?.serial_number }}
              </span>
            </template>
            <!-- <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Type"
              />
            </template> -->
          </Column>
          <Column
            sortable
            field="created_at"
            header="Assigned"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <span>{{ formatDateTime(data.created_at) }}</span>
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="dd/mm/yy"
                placeholder="mm/dd/yyyy"
              />
            </template>
          </Column>
          <Column
            field="reserveduntil"
            header="Reserved Until"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <span v-if="data?.chamber_id">
                {{ data.reservation_type === 'persistent' ? 'Until unassigned' : 'Until next access' }}
              </span>
              <span v-else>
                {{ formatDateTime(data.reserved_until) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <!--modal here-->
  <Dialog
    v-model:visible="show"
    header="Change Password"
    :style="{ width: '50vw' }"
  >
    <div>
      <Password
        v-model="password"
        toggle-mask
        placeholder="New Password"
        class="password-input w-full"
        :class="v$.password.$error ? 'p-invalid': ''"
        input-class="w-full"
      >
        <template #header><h6>Pick a password</h6></template>
        <template #footer="sp">
          {{ sp.level }}
          <Divider />
          <p class="mt-2">Suggestions</p>
          <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
            <li>At least one lowercase</li>
            <li>At least one uppercase</li>
            <li>At least one numeric</li>
            <li>Minimum 8 characters</li>
          </ul>
        </template>
      </Password>
      <div v-if="v$.password.$error">
        <small v-for="(error, index) in v$.password.$errors" :key="index" class="p-error">
          <p class="p-0 m-0">{{ error.$message }}</p>
        </small>
      </div>
    </div>

    <Password
      v-model="cpassword"
      toggle-mask
      placeholder="Confirm Password"
      class="password-input w-full mt-3"
      :class="v$.cpassword.$error ? 'p-invalid': ''"
      input-class="w-full"
      :feedback="false"
    />
    <small v-if="v$.cpassword.$error" class="p-error">{{ v$.cpassword.$errors[0].$message }}</small>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closePopUp"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        class="e2e-proceed-button"
        autofocus
        @click="okHandler"
      />
    </template>
  </Dialog>

  <!-- Edit user modal -->

  <Dialog
    v-model:visible="showEditUser"
    header="Edit User"
    :style="{ width: '50vw' }"
  >
    <InputText
      v-model="email"
      type="text"
      placeholder="Email"
      style="width: 100%"
      class="e2e-update-user"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeEditUser"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        class="e2e-update-email"
        autofocus
        @click="editEmail"
      />
    </template>
  </Dialog>

  <!-- edit role dialog  -->
  <Dialog
    v-model:visible="showRole"
    header="Edit Role"
    :style="{ width: '50vw' }"
  >
    <Dropdown
      id="role"
      v-model="role"
      :options="roles"
      optionLabel="name"
      class="my-2 e2e-edit-role"
      style="width: 100%"
      placeholder="Select Role"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeRole"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        class="e2e-update-role"
        autofocus
        @click="editRole"
      />
    </template>
  </Dialog>

  <!-- Edit User Phone Number -->
  <Dialog
    v-model:visible="showPhoneNo"
    header="Edit Phone Number"
    :style="{ width: '50vw' }"
  >
    <InputText
      v-model="phoneNo"
      type="number"
      placeholder="Phone Number"
      style="width: 100%"
      class="e2e-update-user"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeEditPhoneNo"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        class="e2e-update-email"
        autofocus
        @click="editPhoneNo"
      />
    </template>
  </Dialog>

  <!-- assess method dialog  -->
  <Dialog
    v-model:visible="showAccessMethods"
    header="Add/Assign a new Access Method"
    :style="{ width: '50vw' }"
    @hide="closeAccessMethodPopUp"
  >
    <h6
      v-if="errorMessage !== ''"
      class="p-error text-center"
    >
      {{ errorMessage }}
    </h6>
    <Dropdown
      id="access_mehtod"
      v-model="selectedAccessMethod"
      :options="accessMethods"
      class="my-3 e2e-access-method-type"
      style="width: 100%"
      placeholder="Access Method Type"
    />
    <div
      style="width: 100%;"
    >
      <!-- <InputText
        v-if="selectedAccessMethod == 'RFID Tag'"
        v-model="pinCode"
        class="mb-3"
        type="text"
        placeholder="Set pin code to?"
        style="width: 100%"
      /> -->
      <InputText
        v-if="selectedAccessMethod == 'RFID Tag'"
        v-model="rfidTag"
        class="mb-3"
        type="text"
        placeholder="Enter RFID Tag Data"
        style="width: 100%"
      />
    </div>
    <Calendar
      v-model="accessStartDate"
      class="w-100 mb-3"
      :show-icon="true"
      :select-other-months="true"
      date-format="mm/dd/yy"
      placeholder="[Optional] Activate Date"
    />
    <Calendar
      v-model="accessEndDate"
      class="w-100 mb-3"
      :select-other-months="true"
      :show-icon="true"
      date-format="mm/dd/yy"
      placeholder="[Optional] Activate Until"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeAccessMethodPopUp"
      />
      <Button
        label="Proceed"
        icon="pi pi-check e2e-submit-proceed"
        autofocus
        @click="addAccessMethod"
      />
    </template>
  </Dialog>

  <!-- all units and bays  modal -->
  <Dialog
    v-model:visible="showBaysModal"
    header="Bay Assignment"
    :style="{ width: '50vw' }"
  >
    <div>
      <h5>Choose a Unit</h5>
      <Dropdown
        v-model="selectedUnit"
        :options="devices"
        option-label="serial_num"
        option-value="id"
        placeholder="Select a Unit"
        class="w-100"
        @change="changeUnitsHandler"
      />
      <template v-if="selectedUnit">
        <h5>Choose an available chamber</h5>
        <Dropdown
          v-model="selectedBay"
          :options="bays"
          option-label="bayNumber"
          option-value="bayNumber"
          placeholder="Select a Chamber"
          class="w-100"
        />
      </template>
      <template v-if="selectedUnit">
        <h5>Deadline</h5>
        <Calendar
          v-model="retrievalDate"
          class="w-100"
          :show-icon="true"
          date-format="mm/dd/yy"
          placeholder="Pick Retrieval Date"
        />
      </template>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeBaysPopUp"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        :loading="assignBayProcess"
        autofocus
        :disabled="!retrievalDate || !selectedBay"
        @click="submitHandler"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showEmailModel"
    header="Email Body"
    :style="{ width: '50vw' }"
  >
    <div
      class="border-round"
      v-html="emailBody"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        autofocus
        @click="closeEmailPopUp"
      />
    </template>
  </Dialog>
</template>

<script>
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { required, helpers, minLength, sameAs } from '@vuelidate/validators';
import { useToastService } from '../composables/useToast.mjs';

export default defineComponent({
  setup() {
    const { dispatch, getters } = useStore();
    const { params } = useRoute();
    const router = useRouter();
    const user = computed(() => getters.selectedUser);
    const show = ref(false);
    const showBaysModal = ref(false);
    const showEditUser = ref(false);
    const showRole = ref(false);
    const showPhoneNo = ref(false);

    const selectedAccessMethod = ref('');
    const showAccessMethods = ref(false);
    const accessMethods = ref(['RFID Tag', 'Pin Code']);
    const accessEndDate = ref('');
    const accessStartDate = ref('');
    const pinCode = ref('');
    const rfidTag = ref('');

    const isActive = ref(false);

    const values = reactive({
      password: '',
      cpassword: '',
    });
    const state = reactive({
      email: user.value?.email,
      role: user.value?.Role?.name,
      phoneNo: user.value?.phoneNo,
    });
    const units = computed(() => getters.units);
    const bays = computed(() => getters.bays);
    const serialNum = ref(null);
    const reportArr = computed(() => {
      const reportData = getters.userReport;
      reportData?.forEach(element => {
        // eslint-disable-next-line no-param-reassign
        element.date = new Date(element.created_at);
      });
      return reportData;
    });
    watch(reportArr, () => {
      const arr = [];
      reportArr?.value.forEach(element => {
        if (element?.Device?.serial_num) {
          arr.push(`${element?.Device?.serial_num}`);
        }
      });
      serialNum.value = [...new Set(arr)];
    });
    const userNotifications = computed(() => {
      const data = getters.userEmailNotifications;
      data?.forEach(el => {
        // eslint-disable-next-line no-param-reassign
        el.date = new Date(el.created_at);
      });
      return data;
    });
    const devices = computed(() => getters.devices);
    const createdBy = computed(() => getters.UserID);
    const mailSending = ref(false);
    const assignBayProcess = ref(false);
    const selectedUnit = ref(null);
    const selectedBay = ref(null);
    const retrievalDate = ref(null);
    const token = computed(() => getters.token);
    const { showToast } = useToastService();
    const initReportFilters = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      'KbDevice.make': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      'Device.serial_num': {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      'location.name': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      chamber_id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      event: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    const reportFilters = ref(initReportFilters());
    const statuses = ['deposit', 'retrieval', 'access_rejected'];
    const initFilter = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      subject: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      recipient: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      sent: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      received: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      opened: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      undelivered: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
    const loading = ref(true);
    const filters = ref(initFilter());
    const emailBody = ref(null);
    const showEmailModel = ref(false);
    const roleId = computed(() => getters.roleId);

    const initFilter2 = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      type: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      data: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      date: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    const initreservationfilter = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    const filters2 = ref(initFilter2());
    const reservationfilters = ref(initreservationfilter());
    const clearReportFilter = () => {
      reportFilters.value = initReportFilters();
    };
    const formatDateTime = value => new Date(value).toLocaleString();

    const isActiveAccessMethod = data => {
      const now = Date.now();
      const startDate = Date.parse(data.active_from);
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(startDate) || startDate > now) return false;

      if (!data.active_until) return true;
      const endDate = Date.parse(data.active_until);
      if (endDate > now) return true;
      return false;
    };

    const userAccessMethod = computed(() => {
      const data = getters.userAccessMethod;
      data?.forEach(el => {
        // eslint-disable-next-line no-param-reassign
        el.date = new Date(el.created_at);
        // eslint-disable-next-line no-param-reassign
        el.statusColTemplate = isActiveAccessMethod(el) ? 'Active' : 'Inactive';
      });
      return data;
    });

    const closeEditUser = () => {
      showEditUser.value = false;
    };

    const closeEditPhoneNo = () => {
      showPhoneNo.value = false;
    };

    const updateIsActive = async () => {
      try {
        await dispatch('updateUser', {
          ...params,
          body: { is_active: isActive.value },
        });
        showToast({ detail: 'User status successfully updated' });
        dispatch('getUser', params.id);
        closeEditUser();
      } catch (error) {
        console.log(error);
      }
    };

    // validation rules
    const rules = computed(() => ({
      password: {
        required: helpers.withMessage('New password is required', required),
        minLength: helpers.withMessage('Password must be at least 8 characters', minLength(8)),
        containsUppercase: helpers.withMessage(
          () => 'Password must be at least one uppercase',
          value => /[A-Z]/.test(value),
        ),
        containsLowercase: helpers.withMessage(
          () => 'Password must be at least one lowercase',
          value => /[a-z]/.test(value),
        ),
        containsNumber: helpers.withMessage(
          () => 'Password must be at least one numeric',
          value => /[0-9]/.test(value),
        ),
      },
      cpassword: {
        required: helpers.withMessage('Password confirmation is required', required),
        sameAs: helpers.withMessage('Confirm password must be same as password', sameAs(values.password)),
      },
    }));
    const v$ = useVuelidate(rules, values);

    const userReservations = computed(
      () => getters.userReservations?.map(el => ({ ...el, date: new Date(el.created_at) })),
    );

    const isKwikiq = window.location.host.split('.')[0]?.includes('kwikiq');

    onMounted(async () => {
      await dispatch('getUser', params.id);
      await dispatch('userReport', params.id);
      if (roleId.value) { await dispatch('getPermissionByRoleId', { roleId: roleId.value }); }
      await dispatch('userEmailNotifications', params.id);
      await dispatch('findAccessMethodByUserId', params.id);
      await dispatch('getRoles');
      await dispatch('getAllDevices');
      await dispatch('getReservations', params.id);
      isActive.value = user.value?.is_active;
      loading.value = false;
    });
    const rolesData = computed(() => getters.roles);
    const role = computed(() => rolesData.value.map(elm => ({ name: elm.name, value: elm.id })));
    const roles = computed(() => role.value.filter(el => el.name !== 'Account Holder'));

    const clearFilter = () => {
      filters.value = initFilter();
    };

    const clearAccessMethodFilter = () => {
      filters2.value = initFilter2();
    };
    const clearReservationFilter = () => {
      reservationfilters.value = initreservationfilter();
    };

    const goToUnitDetailPage = data => {
      router.push({ name: 'unit', params: { id: data.Device?.id } });
    };

    const formatDate = value => new Date(value).toLocaleString();

    const stringReplace = str => {
      const n = str.length / 2;
      return (`${str}`).slice(0, -n).replace(/./g, '*') + (`${str}`).slice(-n);
    };

    const unassignUser = async data => {
      await dispatch('unassignUser', {
        accessMethodId: data.id,
      });
      await dispatch('findAccessMethodByUserId', params.id);
      showToast({ detail: 'Unassign User successfully' });
    };

    const viewEmailBody = data => {
      emailBody.value = data.email_body;
      showEmailModel.value = true;
    };

    const closeEmailPopUp = () => {
      showEmailModel.value = false;
    };

    const getPermissionByRoleId = computed(() => getters.RoleByPermission);
    const permissions = computed(() => {
      if (roleId.value === null) { return true; }
      return getPermissionByRoleId.value.some(el => el.name.toLowerCase() === 'User Management'.toLowerCase());
    });

    const closePopUp = () => {
      show.value = false;
    };

    const closeRole = () => {
      showRole.value = false;
    };

    const openPopUp = () => {
      show.value = true;
      values.password = '';
      values.cpassword = '';
    };

    const closeBaysPopUp = () => {
      showBaysModal.value = false;
    };

    const openBaysPopUp = async () => {
      showBaysModal.value = true;
      retrievalDate.value = '';
      selectedBay.value = '';
      selectedUnit.value = '';
    };

    const openEditUser = () => {
      state.email = user.value.email;
      showEditUser.value = true;
    };

    const openEditPhoneNo = () => {
      state.phoneNo = user.value.phoneNo;
      showPhoneNo.value = true;
    };

    const errorMessage = ref('');

    const openAccessMethodPopUp = () => {
      showAccessMethods.value = true;
    };

    const closeAccessMethodPopUp = () => {
      selectedAccessMethod.value = '';
      accessStartDate.value = '';
      accessEndDate.value = '';
      pinCode.value = '';
      rfidTag.value = '';
      errorMessage.value = '';
      showAccessMethods.value = false;
    };

    const addAccessMethod = () => {
      if (selectedAccessMethod.value === 'RFID Tag') {
        if (rfidTag.value) {
          const obj = {
            type: 'rfid_tag',
            data: rfidTag.value,
            user_id: user.value.id,
            active_from: accessStartDate.value ? accessStartDate.value : new Date(),
            active_until: accessEndDate.value ? accessEndDate.value : null,
          };
          dispatch('assingAccess', obj);
          closeAccessMethodPopUp();
          showToast({ detail: 'New Access Method successfully added' });
        } else {
          errorMessage.value = 'RFID Tag is required';
        }
      } else if (selectedAccessMethod.value === 'Pin Code') {
        const obj = {
          type: 'pin_code',
          user_id: user.value.id,
          active_from: accessStartDate.value ? accessStartDate.value : new Date(),
          active_until: accessEndDate.value ? accessEndDate.value : null,
        };
        dispatch('assingAccess', obj);
        closeAccessMethodPopUp();
        showToast({ detail: 'New Access Method added and pincode generated successfully' });
      } else {
        errorMessage.value = 'Access Method Is Required';
      }
    };

    const openRole = () => {
      state.role = { name: user.value.Role?.name, value: user.value.role_id };
      showRole.value = true;
    };

    const changeUnitsHandler = () => dispatch('findBaysByUnitId', selectedUnit.value);

    const okHandler = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          await dispatch('forgetPassword', {
            ...values,
            ...params,
            token: token.value,
          });
          await dispatch('changePasswordEmail', { email: user.value.email });
          showToast({ detail: 'Password successfully updated' });
          v$.value.$reset();
          closePopUp();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const editEmail = async () => {
      try {
        await dispatch('updateUser', {
          ...params,
          body: { email: state.email },
        });
        showToast({ detail: 'User email successfully updated' });
        dispatch('getUser', params.id);
        closeEditUser();
      } catch (error) {
        console.log(error);
      }
    };
    const editRole = async () => {
      try {
        await dispatch('updateUser', {
          ...params,
          body: { access_level: state.role.name, role_id: state.role.value },
        });
        showToast({ detail: 'User role successfully updated' });
        dispatch('getUser', params.id);
        closeRole();
      } catch (error) {
        console.log(error);
      }
    };
    const editPhoneNo = async () => {
      try {
        if (state.phoneNo.length === 10) {
          await dispatch('updateUser', {
            ...params,
            body: { phoneNo: state.phoneNo },
          });
          showToast({ detail: 'User phone number successfully updated' });
          dispatch('getUser', params.id);
          closeEditPhoneNo();
        } else {
          showToast({ severity: 'warn', detail: 'Phone Number lenght must be 10' });
        }
      } catch (error) {
        console.log(error);
      }
    };

    const resetPassword = async () => {
      try {
        mailSending.value = true;
        await dispatch('sendForgetPasswordEmail', { email: user.value.email, sendBy: createdBy.value });
        mailSending.value = false;
        showToast({ detail: `Password reset instructions have been sent to ${user.value.email}` });
      } catch (error) {
        showToast({ severity: 'error', summary: 'Error', detail: 'This request could not be completed at this time. Please try again later.' });
      }
    };

    const submitHandler = async () => {
      try {
        assignBayProcess.value = true;
        await dispatch('assignBay', {
          userId: params.id,
          deviceId: selectedUnit.value,
          chamberId: selectedBay.value,
          reservationType: 'one-off',
          createdBy: createdBy.value,
        });
        selectedUnit.value = false;
        selectedBay.value = false;
        retrievalDate.value = false;
        assignBayProcess.value = false;
        showToast({ detail: 'Device retrieval request assigned successfully' });
        closeBaysPopUp();
      } catch (error) {
        console.log(error);
      }
    };

    return {
      user,
      ...toRefs(values),
      ...toRefs(state),
      show,
      closePopUp,
      showBaysModal,
      reportArr,
      openPopUp,
      v$,
      openBaysPopUp,
      openEditUser,
      showEditUser,
      showRole,
      openEditPhoneNo,
      showPhoneNo,
      errorMessage,
      addAccessMethod,
      accessStartDate,
      accessEndDate,
      rfidTag,
      pinCode,
      selectedAccessMethod,
      showAccessMethods,
      openAccessMethodPopUp,
      closeAccessMethodPopUp,
      accessMethods,
      openRole,
      closeRole,
      closeEditUser,
      closeEditPhoneNo,
      closeBaysPopUp,
      okHandler,
      editEmail,
      editRole,
      editPhoneNo,
      retrievalDate,
      units,
      changeUnitsHandler,
      selectedUnit,
      bays,
      selectedBay,
      resetPassword,
      submitHandler,
      userNotifications,
      loading,
      filters,
      clearFilter,
      formatDate,
      viewEmailBody,
      emailBody,
      showEmailModel,
      closeEmailPopUp,
      permissions,
      userAccessMethod,
      initFilter2,
      filters2,
      stringReplace,
      isActiveAccessMethod,
      unassignUser,
      roles,
      devices,
      mailSending,
      assignBayProcess,
      reportFilters,
      clearReportFilter,
      statuses,
      formatDateTime,
      serialNum,
      isActive,
      isKwikiq,
      updateIsActive,
      clearAccessMethodFilter,
      clearReservationFilter,
      reservationfilters,
      initreservationfilter,
      userReservations,
      goToUnitDetailPage,
    };
  },
});
</script>

<style scoped lang="scss">
.reports-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  &.status-retrieval {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-deposit {
    background: #ffd8b2;
    color: #805b36;
  }

  &.status-access_rejected {
    background: #ffcdd2;
    color: #c63737;
  }
}

.p-avatar.p-avatar-xl {
  width: 6rem;
  height: 6rem;
}

.flex span {
  font-size: 3rem;
}

.user-icon {
  font-size: 5rem;
  color: #64b5f6;
}

.emailHolder {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
