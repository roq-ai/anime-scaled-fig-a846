import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  Flex,
} from '@chakra-ui/react';
import Breadcrumbs from 'components/breadcrumb';
import DatePicker from 'components/date-picker';
import { Error } from 'components/error';
import { FormWrapper } from 'components/form-wrapper';
import { NumberInput } from 'components/number-input';
import { SelectInput } from 'components/select-input';
import { AsyncSelect } from 'components/async-select';
import { TextInput } from 'components/text-input';
import AppLayout from 'layout/app-layout';
import { FormikHelpers, useFormik } from 'formik';
import { useRouter } from 'next/router';
import { FunctionComponent, useState } from 'react';
import * as yup from 'yup';
import { AccessOperationEnum, AccessServiceEnum, requireNextAuth, withAuthorization } from '@roq/nextjs';
import { compose } from 'lib/compose';

import { createSalesAnalytics } from 'apiSdk/sales-analytics';
import { salesAnalyticsValidationSchema } from 'validationSchema/sales-analytics';
import { StoreInterface } from 'interfaces/store';
import { FigureInventoryInterface } from 'interfaces/figure-inventory';
import { getStores } from 'apiSdk/stores';
import { getFigureInventories } from 'apiSdk/figure-inventories';
import { SalesAnalyticsInterface } from 'interfaces/sales-analytics';

function SalesAnalyticsCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: SalesAnalyticsInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createSalesAnalytics(values);
      resetForm();
      router.push('/sales-analytics');
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<SalesAnalyticsInterface>({
    initialValues: {
      sales_count: 0,
      store_id: (router.query.store_id as string) ?? null,
      figure_id: (router.query.figure_id as string) ?? null,
    },
    validationSchema: salesAnalyticsValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              label: 'Sales Analytics',
              link: '/sales-analytics',
            },
            {
              label: 'Create Sales Analytics',
              isCurrent: true,
            },
          ]}
        />
      }
    >
      <Box rounded="md">
        <Box mb={4}>
          <Text as="h1" fontSize={{ base: '1.5rem', md: '1.875rem' }} fontWeight="bold" color="base.content">
            Create Sales Analytics
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        <FormWrapper onSubmit={formik.handleSubmit}>
          <NumberInput
            label="Sales Count"
            formControlProps={{
              id: 'sales_count',
              isInvalid: !!formik.errors?.sales_count,
            }}
            name="sales_count"
            error={formik.errors?.sales_count}
            value={formik.values?.sales_count}
            onChange={(valueString, valueNumber) =>
              formik.setFieldValue('sales_count', Number.isNaN(valueNumber) ? 0 : valueNumber)
            }
          />

          <AsyncSelect<StoreInterface>
            formik={formik}
            name={'store_id'}
            label={'Select Store'}
            placeholder={'Select Store'}
            fetcher={getStores}
            labelField={'name'}
          />
          <AsyncSelect<FigureInventoryInterface>
            formik={formik}
            name={'figure_id'}
            label={'Select Figure Inventory'}
            placeholder={'Select Figure Inventory'}
            fetcher={getFigureInventories}
            labelField={'figure_name'}
          />
          <Flex justifyContent={'flex-start'}>
            <Button
              isDisabled={formik?.isSubmitting}
              bg="state.info.main"
              color="base.100"
              type="submit"
              display="flex"
              height="2.5rem"
              padding="0rem 1rem"
              justifyContent="center"
              alignItems="center"
              gap="0.5rem"
              mr="4"
              _hover={{
                bg: 'state.info.main',
                color: 'base.100',
              }}
            >
              Submit
            </Button>
            <Button
              bg="neutral.transparent"
              color="neutral.main"
              type="button"
              display="flex"
              height="2.5rem"
              padding="0rem 1rem"
              justifyContent="center"
              alignItems="center"
              gap="0.5rem"
              mr="4"
              onClick={() => router.push('/sales-analytics')}
              _hover={{
                bg: 'neutral.transparent',
                color: 'neutral.main',
              }}
            >
              Cancel
            </Button>
          </Flex>
        </FormWrapper>
      </Box>
    </AppLayout>
  );
}

export default compose(
  requireNextAuth({
    redirectTo: '/',
  }),
  withAuthorization({
    service: AccessServiceEnum.PROJECT,
    entity: 'sales_analytics',
    operation: AccessOperationEnum.CREATE,
  }),
)(SalesAnalyticsCreatePage);
