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
  Center,
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
import { FunctionComponent, useState, useRef } from 'react';
import * as yup from 'yup';
import useSWR from 'swr';
import { AccessOperationEnum, AccessServiceEnum, requireNextAuth, withAuthorization } from '@roq/nextjs';
import { compose } from 'lib/compose';
import { ImagePicker } from 'components/image-file-picker';
import { getPurchaseHistoryById, updatePurchaseHistoryById } from 'apiSdk/purchase-histories';
import { purchaseHistoryValidationSchema } from 'validationSchema/purchase-histories';
import { PurchaseHistoryInterface } from 'interfaces/purchase-history';
import { UserInterface } from 'interfaces/user';
import { FigureInventoryInterface } from 'interfaces/figure-inventory';
import { getUsers } from 'apiSdk/users';
import { getFigureInventories } from 'apiSdk/figure-inventories';

function PurchaseHistoryEditPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, error, isLoading, mutate } = useSWR<PurchaseHistoryInterface>(
    () => (id ? `/purchase-histories/${id}` : null),
    () => getPurchaseHistoryById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: PurchaseHistoryInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updatePurchaseHistoryById(id, values);
      mutate(updated);
      resetForm();
      router.push('/purchase-histories');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<PurchaseHistoryInterface>({
    initialValues: data,
    validationSchema: purchaseHistoryValidationSchema,
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
              label: 'Purchase Histories',
              link: '/purchase-histories',
            },
            {
              label: 'Update Purchase History',
              isCurrent: true,
            },
          ]}
        />
      }
    >
      <Box rounded="md">
        <Box mb={4}>
          <Text as="h1" fontSize={{ base: '1.5rem', md: '1.875rem' }} fontWeight="bold" color="base.content">
            Update Purchase History
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}

        <FormWrapper onSubmit={formik.handleSubmit}>
          <FormControl id="purchase_date" mb="4">
            <FormLabel fontSize="1rem" fontWeight={600}>
              Purchase Date
            </FormLabel>
            <DatePicker
              selected={formik.values?.purchase_date ? new Date(formik.values?.purchase_date) : null}
              onChange={(value: Date) => formik.setFieldValue('purchase_date', value)}
            />
          </FormControl>
          <AsyncSelect<UserInterface>
            formik={formik}
            name={'user_id'}
            label={'Select User'}
            placeholder={'Select User'}
            fetcher={getUsers}
            labelField={'email'}
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
              onClick={() => router.push('/purchase-histories')}
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
    entity: 'purchase_history',
    operation: AccessOperationEnum.UPDATE,
  }),
)(PurchaseHistoryEditPage);
