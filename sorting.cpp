#include <iostream>
#include <string>
using namespace std;
class product
{
	private:
		string product_name;		
		string location;
		string seller;
		float customer_reviews;
		int price;

	public:
		product()
		{
			product_name = '\0';
		}
		product(string product_name, string location, string seller, int price)
		{
			this->product_name = product_name;
			this->location = location;
			this->seller = seller;
			this->price = price;
		}

		float GetReviews()
		{
			return customer_reviews;
		}

		int GetPrice()
		{
			return price;
		}

		void SetReviews(float review)
		{
			customer_reviews = review;
		}
		int Equals(product p)
		{
			if(location.compare(p.location)==0 && product_name.compare(p.product_name)==0 && seller.compare(p.seller)==0)
			{
				return 1;
			}
			else
				return 0;
		}
		void Copy(product p)
		{
			product_name = p.product_name;
			seller = p.seller;
			customer_reviews = p.customer_reviews;
			price = p.price;
		}
		int item_avaliable();
		
};

class queue
{
	private:	
		product p;
		queue *next;
		queue *previous;
		int items;
	
	public:
		queue()
		{
			items = 0;
			previous = 0;
		}
		queue(product p)
		{
			this->p = p;
			this->next = 0;

			if(!p.item_avaliable())
				items++;
		}

		void AddToList(product p);
		queue* at(int i);
		int LessThan(queue *q, int type);	
		void Exchange(queue *q);

		product GetProduct()
		{
			return p;
		}


}*list, *price_sorted, *rating_sorted;

void quicksort(queue* , int, int, int);
/*
int main()
{
	product p1("Rice", "Kochi", "Leon", 10);
	p1.SetReviews(5);
	product p2("Wheat", "Kochi", "Bharat", 200);
	p2.SetReviews(1);
	product p3("Wheat", "Bombay", "Mishra", 300);
	p3.SetReviews(3);
	product p4("Barley", "Coimbatore", "Suubin", 250);
	p4.SetReviews(4.5);
	product p5("Rice", "Kochi", "Devashish", 50);
	p5.SetReviews(4);

	list->AddToList(p1);
	list->AddToList(p2);
	list->AddToList(p3);
	list->AddToList(p4);
	list->AddToList(p5);

	quicksort(list, 0, 4, 2);

	return 0;
}
*/
void quicksort(queue *list, int low, int high, int type)
{
    int pivot, i, j, temp;

    if (low < high)
    {
        pivot = low;
        i = low;
        j = high;

		while (i < j)
		{
			while (i <= high && list->at(i)->LessThan(list->at(pivot), type))
				i++;

            while (j >= low && !list->at(j)->LessThan(list->at(pivot), type))
                j--;

            if (i < j)
            {
				list->at(i)->Exchange(list->at(j));
            }
        }

		list->at(j)->Exchange(list->at(pivot));

        quicksort(list, low, j - 1, type);

        quicksort(list, j + 1, high, type);

    }
}

int product::item_avaliable()
{
	queue *q;

	q = list;

	while(q)
	{
		if(product_name.compare(this->product_name) == 0)
			return 1;
	}

	return 0;
}

int queue::LessThan(queue *q, int type)
{
	switch(type)
	{
		case 1:							// customer rating
			if(this->p.GetReviews() >= q->p.GetReviews())
				return 1;
			else
				return 0;
			break;
		case 2:							//price
			if(this->p.GetPrice() <= q->p.GetPrice())
				return 1;
			else
				return 0;
		default:
			cout << "Wrong code" << endl;
			return -1;
	}
}
void queue::AddToList(product p)
{
	queue *q, *new_item;

	q = list;

	if(list==0)
	{
		list = new queue(p);
	}
	else
	{
		while(q->next!=0)
			q = q->next;

		new_item = new queue(p);
		q->next = new_item;
		new_item->previous = q;
	}
}
queue* queue::at(int i)
{
	queue *q;
	int j = 0;

	for(q = list; q != 0; q = q->next)
	{
		if(j==i)
			return q;
		j++;
	}	
	return 0;
}
void queue::Exchange(queue *q)
{
	product temp;

	temp.Copy(this->p);
	this->p.Copy(q->p);
	q->p.Copy(temp);

}
